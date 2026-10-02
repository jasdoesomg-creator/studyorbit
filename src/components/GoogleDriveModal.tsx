import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  FileText,
  FileCode,
  FolderOpen,
  Download,
  Upload,
  Trash2,
  ExternalLink,
  RefreshCw,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Lock,
  Sparkles,
  Cloud,
  FileUp,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  logout,
  getCurrentUser,
  initAuth,
  listDriveFiles,
  readDriveFileText,
  uploadNoteToDrive,
  deleteDriveFile,
  DriveFileItem,
  getAccessToken,
} from '../services/driveService';
import { SubjectType } from '../types';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportToNotes?: (content: string, fileName: string, suggestedSubject?: SubjectType) => void;
  activeSubject?: SubjectType;
  currentNotesContent?: string;
  currentNotesTitle?: string;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  onImportToNotes,
  activeSubject = 'Maths',
  currentNotesContent = '',
  currentNotesTitle = '',
}) => {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Drive files state
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'docs' | 'text'>('all');
  const [fileError, setFileError] = useState<string | null>(null);

  // File import state
  const [importingFileId, setImportingFileId] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // Quick export state
  const [exportTitle, setExportTitle] = useState<string>(
    currentNotesTitle || `${activeSubject} - Revision Notes`
  );
  const [exportContent, setExportContent] = useState<string>(currentNotesContent);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccessItem, setExportSuccessItem] = useState<DriveFileItem | null>(null);

  // Active tab inside modal
  const [activeTab, setActiveTab] = useState<'browse' | 'export'>('browse');

  // Mandatory Confirmation Dialog for Destructive Operations
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser) => {
        setUser(authUser);
        setAuthError(null);
      },
      () => {
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isOpen && user) {
      loadFiles();
    }
  }, [isOpen, user, filterType]);

  useEffect(() => {
    if (currentNotesTitle) {
      setExportTitle(currentNotesTitle);
    }
    if (currentNotesContent) {
      setExportContent(currentNotesContent);
    }
  }, [currentNotesTitle, currentNotesContent]);

  const handleSignIn = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        await loadFiles();
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setAuthError(err?.message || 'Authentication with Google failed. Please try again.');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      setFiles([]);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const loadFiles = async () => {
    setIsLoadingFiles(true);
    setFileError(null);
    try {
      const driveFiles = await listDriveFiles(searchQuery, filterType);
      setFiles(driveFiles);
    } catch (err: any) {
      console.error('Error loading drive files:', err);
      setFileError(err?.message || 'Could not fetch files from Google Drive.');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadFiles();
  };

  const handleImportFile = async (file: DriveFileItem) => {
    setImportingFileId(file.id);
    setFileError(null);
    setImportSuccessMessage(null);
    try {
      const content = await readDriveFileText(file.id, file.mimeType);
      if (onImportToNotes) {
        onImportToNotes(content, file.name, activeSubject);
        setImportSuccessMessage(`Imported "${file.name}" into Notes Simplifier!`);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error('Error reading file content:', err);
      setFileError(`Failed to import "${file.name}": ${err?.message || 'Unknown error'}`);
    } finally {
      setImportingFileId(null);
    }
  };

  const handleExportToDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exportTitle.trim() || !exportContent.trim()) {
      setFileError('Please provide both a file title and content to export.');
      return;
    }

    setIsExporting(true);
    setFileError(null);
    setExportSuccessItem(null);
    try {
      const createdItem = await uploadNoteToDrive(exportTitle.trim(), exportContent);
      setExportSuccessItem(createdItem);
      // Reload files in background
      loadFiles();
    } catch (err: any) {
      console.error('Failed to export to Drive:', err);
      setFileError(`Failed to export to Google Drive: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Mandatory confirmation dialog confirmation handler
  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    setFileError(null);
    try {
      await deleteDriveFile(fileToDelete.id);
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setFileToDelete(null);
    } catch (err: any) {
      console.error('Error deleting file:', err);
      setFileError(`Failed to delete "${fileToDelete.name}": ${err?.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Cloud className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Google Drive Integration</span>
              </h3>
              <p className="text-xs text-slate-500">
                Import study docs and export revision cheat sheets with permission
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Authentication State Card */}
          {!user ? (
            <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-50/60 to-slate-50 border border-blue-100 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
                <Cloud className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-base font-bold text-slate-900">
                  Connect Your Google Drive
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sign in with your Google Account to import your class lecture notes, textbook
                  summaries, and export your high-yield formula cheat sheets directly to Drive.
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 text-left max-w-md mx-auto">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Official Google Sign-In Button */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isLoadingAuth}
                  className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all shadow-xs hover:shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="w-4.5 h-4.5"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>
                    {isLoadingAuth ? 'Connecting to Google Drive...' : 'Sign in with Google'}
                  </span>
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Accesses your files only with your explicit permission</span>
              </div>
            </div>
          ) : (
            /* Signed In User View */
            <div className="space-y-5">
              {/* Account Ribbon */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google User'}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full border border-slate-300 object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      {user.displayName?.[0] || user.email?.[0] || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {user.displayName || 'Google Account Connected'}
                    </div>
                    <div className="text-[11px] text-slate-500">{user.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadFiles}
                    disabled={isLoadingFiles}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 text-xs transition-colors"
                    title="Refresh Drive files"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-600 text-xs transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Sub-Tabs: Browse & Import vs Export to Drive */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('browse')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === 'browse'
                      ? 'bg-blue-50 text-blue-800'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Browse & Import Files</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('export')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === 'export'
                      ? 'bg-blue-50 text-blue-800'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileUp className="w-4 h-4" />
                  <span>Save Notes to Drive</span>
                </button>
              </div>

              {/* Error or Success Alerts */}
              {fileError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{fileError}</span>
                </div>
              )}
              {importSuccessMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{importSuccessMessage}</span>
                </div>
              )}

              {/* Tab 1: Browse & Import */}
              {activeTab === 'browse' && (
                <div className="space-y-4">
                  {/* Search and Filter Bar */}
                  <form onSubmit={handleSearchSubmit} className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Google Drive documents, notes, PDFs..."
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setFilterType('all')}
                        className={`px-2.5 py-1 rounded-lg ${
                          filterType === 'all'
                            ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                            : 'text-slate-600'
                        }`}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterType('docs')}
                        className={`px-2.5 py-1 rounded-lg ${
                          filterType === 'docs'
                            ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                            : 'text-slate-600'
                        }`}
                      >
                        Docs
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterType('text')}
                        className={`px-2.5 py-1 rounded-lg ${
                          filterType === 'text'
                            ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                            : 'text-slate-600'
                        }`}
                      >
                        Text/MD
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoadingFiles}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                    >
                      Search
                    </button>
                  </form>

                  {/* Files List */}
                  {isLoadingFiles ? (
                    <div className="py-12 text-center space-y-2">
                      <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                      <p className="text-xs text-slate-500">Loading files from Google Drive...</p>
                    </div>
                  ) : files.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl p-6 space-y-2">
                      <FolderOpen className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-semibold text-slate-700">No matching files found</p>
                      <p className="text-[11px] text-slate-400">
                        Try searching for specific filenames or upload notes using the Save tab.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {file.mimeType.includes('document') ? (
                              <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                            ) : (
                              <FileCode className="w-4 h-4 text-emerald-500 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 truncate" title={file.name}>
                                {file.name}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {file.modifiedTime
                                  ? new Date(file.modifiedTime).toLocaleDateString()
                                  : 'Drive item'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                title="Open in Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => handleImportFile(file)}
                              disabled={importingFileId === file.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors disabled:opacity-50"
                            >
                              <Download className="w-3 h-3" />
                              <span>{importingFileId === file.id ? 'Importing...' : 'Import'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setFileToDelete(file)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Export / Save to Drive */}
              {activeTab === 'export' && (
                <form onSubmit={handleExportToDrive} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Document Title</label>
                    <input
                      type="text"
                      value={exportTitle}
                      onChange={(e) => setExportTitle(e.target.value)}
                      placeholder="e.g. Calculus Integration - Cheat Sheet"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Notes Content</label>
                    <textarea
                      value={exportContent}
                      onChange={(e) => setExportContent(e.target.value)}
                      rows={7}
                      placeholder="Enter or paste the study notes to save to Google Drive..."
                      className="w-full p-3 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none leading-relaxed"
                      required
                    />
                  </div>

                  {exportSuccessItem && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Saved "{exportSuccessItem.name}" to your Google Drive!</span>
                      </div>
                      {exportSuccessItem.webViewLink && (
                        <a
                          href={exportSuccessItem.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold underline inline-flex items-center gap-1"
                        >
                          <span>Open in Drive</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('browse')}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isExporting || !exportContent.trim()}
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isExporting ? 'Uploading to Drive...' : 'Upload to Google Drive'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500">
          <span>Google Drive API v3</span>
          <button
            type="button"
            onClick={onClose}
            className="hover:text-slate-800 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>

      {/* MANDATORY EXPLICIT CONFIRMATION DIALOG FOR DESTRUCTIVE ACTIONS */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">
                Delete File from Google Drive?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-900">"{fileToDelete.name}"</strong> from your Google Drive? This action will permanently remove the file.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteFile}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
