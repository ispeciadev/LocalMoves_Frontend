// src/pages/admin/ManageEmailTemplates.jsx
import React, { useEffect, useState, useRef } from "react";
import { FaEnvelope, FaEdit, FaBold, FaItalic, FaUnderline, FaLink, FaAlignLeft, FaAlignCenter, FaAlignRight } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { useAdminThemeStore } from "../../stores/useAdminThemeStore";

// ---------- Rich Text Editor Component ----------
function RichTextEditor({ content, onChange, isDarkMode, variables }) {
    const editorRef = useRef(null);
    const [showVariableMenu, setShowVariableMenu] = useState(false);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (editorRef.current && content && !initialized) {
            editorRef.current.innerHTML = content;
            setInitialized(true);
        }
    }, [content, initialized]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const insertVariable = (variable) => {
        const varText = `{${variable}}`;
        execCommand("insertText", varText);
        setShowVariableMenu(false);
    };

    const changeTextColor = (color) => {
        execCommand("foreColor", color);
    };

    const changeFontSize = (size) => {
        execCommand("fontSize", size);
    };

    return (
        <div className="space-y-2">
            {/* Toolbar */}
            <div
                className={`flex flex-wrap gap-1 p-2 rounded-lg border ${isDarkMode
                    ? "border-slate-600 bg-slate-700/50"
                    : "border-gray-300 bg-gray-100"
                    }`}
            >
                {/* Text Formatting */}
                <button
                    type="button"
                    onClick={() => execCommand("bold")}
                    className={`p-2 rounded hover:bg-pink-500 hover:text-white transition ${isDarkMode ? "text-slate-300" : "text-gray-700"
                        }`}
                    title="Bold"
                >
                    <FaBold />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand("italic")}
                    className={`p-2 rounded hover:bg-pink-500 hover:text-white transition ${isDarkMode ? "text-slate-300" : "text-gray-700"
                        }`}
                    title="Italic"
                >
                    <FaItalic />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand("underline")}
                    className={`p-2 rounded hover:bg-pink-500 hover:text-white transition ${isDarkMode ? "text-slate-300" : "text-gray-700"
                        }`}
                    title="Underline"
                >
                    <FaUnderline />
                </button>

                <div className="w-px bg-gray-400 mx-1" />

                {/* Alignment */}
                <button
                    type="button"
                    onClick={() => execCommand("justifyLeft")}
                    className={`p-2 rounded hover:bg-pink-500 hover:text-white transition ${isDarkMode ? "text-slate-300" : "text-gray-700"
                        }`}
                    title="Align Left"
                >
                    <FaAlignLeft />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand("justifyCenter")}
                    className={`p-2 rounded hover:bg-pink-500 hover:text-white transition ${isDarkMode ? "text-slate-300" : "text-gray-700"
                        }`}
                    title="Align Center"
                >
                    <FaAlignCenter />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand("justifyRight")}
                    className={`p-2 rounded hover:bg-pink-500 hover:text-white transition ${isDarkMode ? "text-slate-300" : "text-gray-700"
                        }`}
                    title="Align Right"
                >
                    <FaAlignRight />
                </button>

                <div className="w-px bg-gray-400 mx-1" />

                {/* Font Size */}
                <select
                    onChange={(e) => changeFontSize(e.target.value)}
                    className={`px-2 py-1 rounded text-xs ${isDarkMode
                        ? "bg-slate-600 text-slate-200 border-slate-500"
                        : "bg-white text-gray-700 border-gray-300"
                        }`}
                    defaultValue="3"
                >
                    <option value="1">Small</option>
                    <option value="3">Normal</option>
                    <option value="5">Large</option>
                    <option value="7">Huge</option>
                </select>

                {/* Text Color */}
                <input
                    type="color"
                    onChange={(e) => changeTextColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer"
                    title="Text Color"
                />

                <div className="w-px bg-gray-400 mx-1" />

                {/* Insert Link */}
                <button
                    type="button"
                    onClick={() => {
                        const url = prompt("Enter URL:");
                        if (url) execCommand("createLink", url);
                    }}
                    className={`p-2 rounded hover:bg-pink-500 hover:text-white transition ${isDarkMode ? "text-slate-300" : "text-gray-700"
                        }`}
                    title="Insert Link"
                >
                    <FaLink />
                </button>

                <div className="w-px bg-gray-400 mx-1" />

                {/* Insert Variable */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowVariableMenu(!showVariableMenu)}
                        className={`px-3 py-1 rounded text-xs font-medium transition ${isDarkMode
                            ? "bg-purple-600 text-white hover:bg-purple-700"
                            : "bg-purple-500 text-white hover:bg-purple-600"
                            }`}
                    >
                        Insert Variable
                    </button>
                    {showVariableMenu && (
                        <div
                            className={`absolute top-full left-0 mt-1 rounded-lg border shadow-lg z-10 min-w-[150px] ${isDarkMode
                                ? "bg-slate-700 border-slate-600"
                                : "bg-white border-gray-200"
                                }`}
                        >
                            {variables.map((v) => (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() => insertVariable(v)}
                                    className={`block w-full text-left px-3 py-2 text-xs hover:bg-pink-500 hover:text-white transition ${isDarkMode ? "text-slate-200" : "text-gray-700"
                                        }`}
                                >
                                    {"{"}
                                    {v}
                                    {"}"}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Editor Area */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className={`min-h-[300px] max-h-[400px] overflow-y-auto p-4 rounded-lg border outline-none ${isDarkMode
                    ? "border-slate-600 bg-slate-800 text-slate-100"
                    : "border-gray-300 bg-white text-gray-900"
                    }`}
                style={{
                    fontFamily: "Arial, sans-serif",
                }}
            />

            {/* Helper Text */}
            <p
                className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}
            >
                Use the toolbar above to format your email. Click "Insert Variable" to add dynamic content like {"{"}user_name{"}"}, {"{"}user_email{"}"}, etc.
            </p>
        </div>
    );
}

// ---------- Template Editor Modal ----------
function TemplateEditorModal({ isOpen, template, onClose, onSave, loading }) {
    const { isDarkMode } = useAdminThemeStore();
    const [formData, setFormData] = useState({
        email_subject: "",
        email_body: "",
    });

    useEffect(() => {
        if (isOpen && template) {
            // Use the default template - this is the professionally designed email
            // with purple banner, account details, credentials box, and support info
            setFormData({
                email_subject: template.default_subject || "",
                email_body: template.default_body || "",
            });
        }
    }, [isOpen, template]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <div
                className={`w-full max-w-4xl rounded-2xl shadow-2xl border transition-colors my-8 ${isDarkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-200"
                    }`}
            >
                {/* Header */}
                <div
                    className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? "border-slate-700" : "border-gray-200"
                        }`}
                >
                    <div>
                        <h2
                            className={`text-lg font-semibold ${isDarkMode ? "text-slate-100" : "text-gray-800"
                                }`}
                        >
                            Edit Email Template
                        </h2>
                        <p
                            className={`text-xs mt-1 ${isDarkMode ? "text-slate-400" : "text-gray-500"
                                }`}
                        >
                            {template?.title || template?.name || "Template"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`text-2xl leading-none transition-colors ${isDarkMode
                            ? "text-slate-400 hover:text-slate-200"
                            : "text-gray-400 hover:text-gray-600"
                            }`}
                    >
                        ×
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-4">
                        {/* Subject Field */}
                        <div>
                            <label
                                className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-slate-300" : "text-gray-700"
                                    }`}
                            >
                                Email Subject
                            </label>
                            <input
                                type="text"
                                value={formData.email_subject}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        email_subject: e.target.value,
                                    }))
                                }
                                required
                                className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-400 transition-colors ${isDarkMode
                                    ? "border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-400"
                                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                                    }`}
                                placeholder="Enter email subject"
                            />
                        </div>

                        {/* Email Body Editor */}
                        <div>
                            <label
                                className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-slate-300" : "text-gray-700"
                                    }`}
                            >
                                Email Content
                            </label>
                            <RichTextEditor
                                content={formData.email_body}
                                onChange={(newContent) =>
                                    setFormData((prev) => ({ ...prev, email_body: newContent }))
                                }
                                isDarkMode={isDarkMode}
                                variables={template?.variables || []}
                            />
                        </div>

                        {/* Preview Section */}
                        <div>
                            <label
                                className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-slate-300" : "text-gray-700"
                                    }`}
                            >
                                Live Preview
                            </label>
                            <div
                                className={`w-full rounded-lg border p-4 max-h-60 overflow-auto ${isDarkMode
                                    ? "border-slate-600 bg-slate-900"
                                    : "border-gray-300 bg-gray-50"
                                    }`}
                            >
                                <div dangerouslySetInnerHTML={{ __html: formData.email_body }} />
                            </div>
                        </div>
                    </div>
                </form>

                {/* Action Buttons */}
                <div
                    className={`flex justify-end gap-3 px-6 py-4 border-t ${isDarkMode ? "border-slate-700" : "border-gray-200"
                        }`}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className={`rounded-lg border px-5 py-2 text-sm font-medium transition-colors ${isDarkMode
                            ? "border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            onSave(formData);
                        }}
                        disabled={loading}
                        className={`inline-flex items-center rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${isDarkMode
                            ? "bg-pink-600 hover:bg-pink-700 disabled:opacity-50"
                            : "bg-gradient-to-r from-pink-600 to-pink-500 hover:brightness-110 disabled:opacity-50"
                            }`}
                    >
                        {loading ? "Saving..." : "Save Template"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ---------- MAIN PAGE ----------
const ManageEmailTemplates = () => {
    const { isDarkMode } = useAdminThemeStore();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    const [showEditorModal, setShowEditorModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // Fetch templates
    const fetchTemplates = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await api.get(
                "localmoves.api.dashboard.manage_signup_verification_template"
            );

            const data = res.data?.message || {};

            // Create template object from the actual API response structure
            const signupTemplate = {
                id: "signup_verification",
                name: data.template?.name || "signup_verification",
                title: data.template?.title || "Logistics Manager Welcome Email",
                description:
                    "Welcome email sent to new logistics managers with their account details and login credentials",
                type: "Account Creation",
                // Current template being sent to users (custom or default)
                email_subject: data.email_subject || data.template?.default_subject || "",
                email_body: data.email_body || data.template?.default_body || "",
                // Default template from code
                default_subject: data.template?.default_subject || "",
                default_body: data.template?.default_body || "",
                // Other metadata
                variables: data.template?.variables || [],
                is_custom: data.is_custom || false,
                last_updated: data.last_updated || new Date().toISOString(),
                file: data.template?.file || "",
                line: data.template?.line || 0,
            };

            setTemplates([signupTemplate]);
        } catch (err) {
            console.error(err);
            setError("Failed to load email templates. Please check the server.");
            toast.error("Failed to load email templates.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const openEditorModal = (template) => {
        setSelectedTemplate(template);
        setShowEditorModal(true);
    };

    const handleSaveTemplate = async (formData) => {
        try {
            setActionLoading(true);

            const payload = {
                email_subject: formData.email_subject,
                email_body: formData.email_body,
            };

            const res = await api.post(
                "localmoves.api.dashboard.manage_signup_verification_template",
                payload
            );

            toast.success(
                res.data?.message?.message || "Template updated successfully"
            );

            setShowEditorModal(false);
            setSelectedTemplate(null);
            fetchTemplates();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update template. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div
            className={`space-y-4 pb-6 transition-colors ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-white text-gray-900"
                }`}
        >
            {/* Header */}
            <div className="mb-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1
                        className={`text-lg md:text-xl font-semibold transition-colors ${isDarkMode ? "text-slate-100" : "text-gray-900"
                            }`}
                    >
                        Email Templates
                    </h1>
                    <p
                        className={`text-xs md:text-sm transition-colors ${isDarkMode ? "text-slate-400" : "text-gray-500"
                            }`}
                    >
                        Manage and customize email templates sent to users.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchTemplates}
                    className={`self-start md:self-auto px-3 md:px-4 py-1.5 md:py-2 rounded-full border text-xs md:text-sm hover:transition flex items-center gap-2 transition-colors flex-shrink-0 ${isDarkMode
                        ? "bg-pink-900/20 border-pink-700/50 text-pink-300 hover:bg-pink-900/30"
                        : "bg-pink-100 border-pink-300 text-pink-900 hover:bg-pink-200"
                        }`}
                >
                    <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                    <span className="hidden sm:inline">Refresh data</span>
                    <span className="sm:hidden">Refresh</span>
                </button>
            </div>

            {/* Error state */}
            {!loading && error && (
                <div
                    className={`rounded-2xl border p-3 text-xs md:text-sm transition-colors ${isDarkMode
                        ? "border-red-900/30 bg-red-900/20 text-red-300"
                        : "border-red-200 bg-red-50 text-red-700"
                        }`}
                >
                    {error}
                </div>
            )}

            {/* Loading state */}
            {loading ? (
                <div className="flex h-40 items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <div
                            className={`h-7 w-7 animate-spin rounded-full border-2 border-t-transparent ${isDarkMode ? "border-pink-400" : "border-pink-400"
                                }`}
                        />
                        <p
                            className={`text-xs transition-colors ${isDarkMode ? "text-slate-400" : "text-gray-400"
                                }`}
                        >
                            Loading templates…
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Templates Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                className={`rounded-2xl border p-5 shadow-sm backdrop-blur transition-all hover:shadow-md ${isDarkMode
                                    ? "border-slate-700 bg-slate-800/50"
                                    : "border-pink-100 bg-white/80"
                                    }`}
                            >
                                {/* Template Icon */}
                                <div
                                    className={`inline-flex items-center justify-center rounded-xl p-3 mb-4 ${isDarkMode
                                        ? "bg-pink-900/30 text-pink-400"
                                        : "bg-pink-100 text-pink-600"
                                        }`}
                                >
                                    <FaEnvelope className="h-6 w-6" />
                                </div>

                                {/* Template Info */}
                                <h3
                                    className={`text-base font-semibold mb-2 transition-colors ${isDarkMode ? "text-slate-100" : "text-gray-900"
                                        }`}
                                >
                                    {template.title}
                                </h3>

                                <p
                                    className={`text-xs mb-3 transition-colors ${isDarkMode ? "text-slate-400" : "text-gray-500"
                                        }`}
                                >
                                    {template.description}
                                </p>

                                <div className="flex items-center justify-between mb-4">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium ${isDarkMode
                                            ? "bg-purple-900/30 text-purple-300"
                                            : "bg-purple-50 text-purple-600"
                                            }`}
                                    >
                                        {template.type}
                                    </span>
                                </div>

                                {/* Template Details */}
                                <div
                                    className={`text-[10px] mb-4 space-y-1 ${isDarkMode ? "text-slate-500" : "text-gray-400"
                                        }`}
                                >
                                    <p>
                                        Last updated:{" "}
                                        {new Date(template.last_updated).toLocaleDateString()}
                                    </p>
                                    {template.file && (
                                        <p>
                                            Source: {template.file}:{template.line}
                                        </p>
                                    )}
                                </div>

                                {/* Action Button */}
                                <button
                                    type="button"
                                    onClick={() => openEditorModal(template)}
                                    className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white shadow transition-colors ${isDarkMode
                                        ? "bg-pink-600 hover:bg-pink-700"
                                        : "bg-gradient-to-r from-pink-600 to-pink-500 hover:brightness-110"
                                        }`}
                                >
                                    <FaEdit className="h-3 w-3" />
                                    Edit Template
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Empty state */}
                    {templates.length === 0 && !loading && !error && (
                        <div
                            className={`flex h-40 items-center justify-center px-4 text-center text-xs md:text-sm transition-colors ${isDarkMode ? "text-slate-400" : "text-gray-400"
                                }`}
                        >
                            No email templates found.
                        </div>
                    )}
                </>
            )}

            {/* Template Editor Modal */}
            <TemplateEditorModal
                isOpen={showEditorModal}
                template={selectedTemplate}
                onClose={() => {
                    setShowEditorModal(false);
                    setSelectedTemplate(null);
                }}
                onSave={handleSaveTemplate}
                loading={actionLoading}
            />
        </div>
    );
};

export default ManageEmailTemplates;
