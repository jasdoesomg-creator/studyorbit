/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Reuse existing Firebase app instance if already initialized
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// All Google Drive scopes configured for the application
export const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.activity',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/drive.meet.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.scripts',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => {
  provider.addScope(scope);
});

// Flag to indicate if we are in the middle of a sign-in flow
let isSigningIn = false;

// In-memory token cache (NEVER stored in localStorage or sessionStorage per security guidelines)
let cachedAccessToken: string | null = null;
let currentUser: User | null = null;

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  iconLink?: string;
  webViewLink?: string;
}

/**
 * Initialize auth state listener.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    currentUser = user;
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token must be refreshed via user sign-in popup if cache was lost
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Trigger Google Sign In popup requesting Google Drive scopes
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve access token from Google authentication');
    }

    cachedAccessToken = credential.accessToken;
    currentUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getCurrentUser = (): User | null => {
  return currentUser || auth.currentUser;
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
  currentUser = null;
};

/**
 * Fetch files from user's Google Drive.
 */
export const listDriveFiles = async (
  searchQuery?: string,
  filterType?: 'all' | 'docs' | 'text'
): Promise<DriveFileItem[]> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please sign in with Google to access Google Drive.');
  }

  // Construct query: exclude trashed files
  const queryParts: string[] = ['trashed = false'];

  if (filterType === 'docs') {
    queryParts.push(
      "(mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/pdf')"
    );
  } else if (filterType === 'text') {
    queryParts.push(
      "(mimeType = 'text/plain' or mimeType = 'text/markdown' or mimeType = 'application/json')"
    );
  }

  if (searchQuery && searchQuery.trim().length > 0) {
    const escaped = searchQuery.replace(/'/g, "\\'");
    queryParts.push(`name contains '${escaped}'`);
  }

  const q = queryParts.join(' and ');
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('q', q);
  url.searchParams.set('fields', 'files(id, name, mimeType, modifiedTime, size, iconLink, webViewLink)');
  url.searchParams.set('orderBy', 'modifiedTime desc');
  url.searchParams.set('pageSize', '30');

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to fetch Drive files: ${res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
};

/**
 * Read the content of a file from Google Drive.
 * Handles both Google Docs (exported to text/plain) and standard text/markdown files.
 */
export const readDriveFileText = async (fileId: string, mimeType: string): Promise<string> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please sign in with Google to read Drive files.');
  }

  let fetchUrl: string;
  if (mimeType === 'application/vnd.google-apps.document') {
    // Export Google Docs to plain text
    fetchUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
  } else {
    // Direct file download for text/plain, text/markdown, etc.
    fetchUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  }

  const res = await fetch(fetchUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Failed to read file content (${res.status}): ${errText || res.statusText}`);
  }

  return await res.text();
};

/**
 * Save notes or summaries to user's Google Drive as a text document.
 */
export const uploadNoteToDrive = async (
  fileName: string,
  content: string,
  mimeType: string = 'text/plain'
): Promise<DriveFileItem> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please sign in with Google to save to Drive.');
  }

  const boundary = '-------KnowledgeDashBoundary' + Math.random().toString(36).substring(2);
  const metadata = {
    name: fileName.endsWith('.txt') || fileName.endsWith('.md') ? fileName : `${fileName}.txt`,
    mimeType: mimeType,
    description: 'Created by KnowledgeDash - STEM Syllabus & Exam Prep',
  };

  const multipartBody =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
    `${content}\r\n` +
    `--${boundary}--`;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to upload file to Drive: ${res.statusText}`);
  }

  return await res.json();
};

/**
 * Delete a file from Google Drive.
 * MANDATORY REQUIREMENT: Callers MUST provide an explicit user confirmation dialog before invoking this!
 */
export const deleteDriveFile = async (fileId: string): Promise<void> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated.');
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to delete file from Drive: ${res.statusText}`);
  }
};
