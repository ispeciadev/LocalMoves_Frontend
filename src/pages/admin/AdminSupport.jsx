import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAdminThemeStore } from "../../stores/useAdminThemeStore";
import api from "../../api/axios";
import { toast } from "react-toastify";

// Icons
const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const StatusBadge = ({ status, isDarkMode }) => {
  const getStatusConfig = useCallback(() => {
    const statusLower = String(status || "").toLowerCase();

    const config = {
      new: { color: "bg-pink-100 text-pink-800", darkColor: "bg-pink-900/30 text-pink-300", label: "New" },
      responded: { color: "bg-pink-100 text-pink-800", darkColor: "bg-pink-900/30 text-pink-300", label: "Responded" },
      closed: { color: "bg-pink-100 text-pink-800", darkColor: "bg-pink-900/30 text-pink-300", label: "Closed" },
      open: { color: "bg-pink-100 text-pink-800", darkColor: "bg-pink-900/30 text-pink-300", label: "New" },
      pending: { color: "bg-pink-100 text-pink-800", darkColor: "bg-pink-900/30 text-pink-300", label: "Pending" },
      resolved: { color: "bg-pink-100 text-pink-800", darkColor: "bg-pink-900/30 text-pink-300", label: "Resolved" },
    };

    return config[statusLower] || {
      color: "bg-pink-100 text-pink-800",
      darkColor: "bg-pink-900/30 text-pink-300",
      label: status || "Unknown"
    };
  }, [status]);

  const { color, darkColor, label } = getStatusConfig();
  const badgeClass = isDarkMode ? darkColor : color;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
      <span className={`w-2 h-2 rounded-full mr-2 ${isDarkMode ? 'bg-current' : 'bg-current/30'}`}></span>
      {label}
    </span>
  );
};

const AdminSupport = () => {
  const { isDarkMode } = useAdminThemeStore();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, new: 0, responded: 0, closed: 0 });
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("New");

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const startTime = Date.now();

      const res = await api.get("/localmoves.api.dashboard.get_all_contact_submissions");

      if (res?.data?.message?.success) {
        const data = res.data.message.data || [];

        // Process contacts with proper status handling
        const processedContacts = data.map(contact => {
          let status = "New";

          if (contact.status) {
            const statusValue = String(contact.status).trim().toLowerCase();
            if (statusValue === "new" || statusValue === "open" || statusValue === "pending") status = "New";
            else if (statusValue === "responded") status = "Responded";
            else if (statusValue === "closed" || statusValue === "resolved") status = "Closed";
            else status = contact.status;
          } else if (contact.status_type) {
            const statusValue = String(contact.status_type).trim().toLowerCase();
            if (statusValue === "new") status = "New";
            else if (statusValue === "responded") status = "Responded";
            else if (statusValue === "closed") status = "Closed";
          } else if (contact.state) {
            const statusValue = String(contact.state).trim().toLowerCase();
            if (statusValue === "new") status = "New";
            else if (statusValue === "responded") status = "Responded";
            else if (statusValue === "closed") status = "Closed";
          }

          return {
            ...contact,
            name: contact.name || contact.id || contact.contact_id || `contact-${Date.now()}`,
            name_of_sender: contact.name_of_sender || contact.name || contact.full_name || contact.sender_name || "Unknown User",
            email: contact.email || contact.email_address || contact.sender_email || "No email",
            message: contact.message || contact.query || contact.comment || contact.content || "No message content",
            created_at: contact.created_at || contact.date_created || contact.timestamp || contact.created_on || new Date().toISOString(),
            responded_at: contact.responded_at || contact.response_date || contact.responded_on || null,
            admin_response: contact.admin_response || contact.response || contact.admin_reply || "",
            status: status
          };
        });

        setContacts(processedContacts);

        // Calculate stats
        const newCount = processedContacts.filter(c => c.status === "New").length;
        const respondedCount = processedContacts.filter(c => c.status === "Responded").length;
        const closedCount = processedContacts.filter(c => c.status === "Closed").length;

        setStats({
          total: processedContacts.length,
          new: newCount,
          responded: respondedCount,
          closed: closedCount
        });
      }

      // Ensure at least 600ms for visual feedback
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 600) {
        await new Promise(resolve => setTimeout(resolve, 600 - elapsedTime));
      }
    } catch {
      toast.error("Failed to load messages. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Filter contacts based on selected tab and search
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const contactStatus = String(contact.status || "").toLowerCase();
      const tab = selectedTab.toLowerCase();

      const matchesTab =
        tab === "all" ||
        (tab === "new" && contactStatus === "new") ||
        (tab === "responded" && contactStatus === "responded") ||
        (tab === "closed" && contactStatus === "closed");

      const matchesSearch =
        searchQuery === "" ||
        (contact.name_of_sender && contact.name_of_sender.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.message && contact.message.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesTab && matchesSearch;
    });
  }, [contacts, selectedTab, searchQuery]);

  // Handle opening modal for a contact
  const handleOpenModal = useCallback((contact) => {
    setSelectedContact(contact);
    setResponseText(contact.admin_response || "");
    setSelectedStatus(contact.status || "New");
    setIsModalOpen(true);
  }, []);

  // Handle status update
  const handleUpdateStatus = useCallback(async (contactId, status) => {
    try {
      setSaving(true);

      await api.post("/localmoves.api.dashboard.update_contact_status", {
        contact_id: contactId,
        status: status,
      });

      toast.success(`Status updated to ${status}`);

      setContacts(prevContacts =>
        prevContacts.map(contact =>
          contact.name === contactId
            ? { ...contact, status: status }
            : contact
        )
      );

      setStats(prevStats => {
        const newStats = { ...prevStats };
        const oldContact = contacts.find(c => c.name === contactId);

        if (oldContact) {
          const oldStatus = oldContact.status.toLowerCase();
          if (oldStatus === "new" && newStats.new > 0) newStats.new--;
          else if (oldStatus === "responded" && newStats.responded > 0) newStats.responded--;
          else if (oldStatus === "closed" && newStats.closed > 0) newStats.closed--;
        }

        if (status === "New") newStats.new++;
        else if (status === "Responded") newStats.responded++;
        else if (status === "Closed") newStats.closed++;

        return newStats;
      });

      if (selectedContact && selectedContact.name === contactId) {
        setSelectedStatus(status);
      }

    } catch {
      toast.error("Failed to update status");
      fetchContacts();
    } finally {
      setSaving(false);
    }
  }, [contacts, selectedContact, fetchContacts]);

  // Handle response submission
  const handleSendResponse = useCallback(async () => {
    if (!responseText.trim()) {
      toast.error("Please enter a response");
      return;
    }

    try {
      setSaving(true);

      await api.post("/localmoves.api.dashboard.respond_to_contact", {
        contact_id: selectedContact.name,
        admin_response: responseText.trim(),
      });

      if (selectedStatus === "New") {
        await handleUpdateStatus(selectedContact.name, "Responded");
      } else {
        setContacts(prevContacts =>
          prevContacts.map(contact =>
            contact.name === selectedContact.name
              ? {
                ...contact,
                admin_response: responseText.trim(),
                responded_at: new Date().toISOString()
              }
              : contact
          )
        );
      }

      toast.success("Response sent successfully");
      setIsModalOpen(false);
      setSelectedContact(null);
      setResponseText("");
      fetchContacts();

    } catch {
      toast.error("Failed to send response");
    } finally {
      setSaving(false);
    }
  }, [selectedContact, responseText, selectedStatus, handleUpdateStatus, fetchContacts]);

  // Handle status change in modal
  const handleStatusChange = useCallback(async (status) => {
    if (!selectedContact) return;

    try {
      setSaving(true);

      await api.post("/localmoves.api.dashboard.update_contact_status", {
        contact_id: selectedContact.name,
        status: status,
      });

      setSelectedStatus(status);

      setContacts(prevContacts =>
        prevContacts.map(contact =>
          contact.name === selectedContact.name
            ? { ...contact, status: status }
            : contact
        )
      );

      setStats(prevStats => {
        const newStats = { ...prevStats };
        const oldStatus = selectedContact.status.toLowerCase();

        if (oldStatus === "new" && newStats.new > 0) newStats.new--;
        else if (oldStatus === "responded" && newStats.responded > 0) newStats.responded--;
        else if (oldStatus === "closed" && newStats.closed > 0) newStats.closed--;

        if (status === "New") newStats.new++;
        else if (status === "Responded") newStats.responded++;
        else if (status === "Closed") newStats.closed++;

        return newStats;
      });

      toast.success(`Status updated to ${status}`);

      if (status === "Closed") {
        setTimeout(() => {
          fetchContacts();
        }, 500);
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setSaving(false);
    }
  }, [selectedContact, fetchContacts]);

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";

    try {
      // Handle various date formats
      let date;

      // Try parsing as ISO string first
      if (typeof dateString === 'string') {
        // Replace space with T for proper ISO format if needed
        const isoString = dateString.includes('T') ? dateString : dateString.replace(' ', 'T');
        date = new Date(isoString);
      } else {
        date = new Date(dateString);
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return "Invalid date";
      }

      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      // Handle future dates
      if (diffMs < 0) {
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        });
      }

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch (error) {
      console.error('Date formatting error:', error, dateString);
      return "Invalid date";
    }
  }, []);

  // Stats cards
  const statCards = useMemo(() => [
    { label: "Total Messages", value: stats.total, color: "bg-pink-500", icon: <MailIcon /> },
    { label: "New", value: stats.new, color: "bg-pink-500", icon: <MailIcon /> },
    { label: "Responded", value: stats.responded, color: "bg-pink-500", icon: <CheckIcon /> },
    { label: "Closed", value: stats.closed, color: "bg-pink-500", icon: <CheckIcon /> },
  ], [stats]);

  const quickResponses = useMemo(() => [
    "Thank you for reaching out. We'll look into this and get back to you.",
    "Your issue has been noted and we're working on it.",
    "Please provide more details so we can assist you better.",
    "This has been resolved in our latest update."
  ], []);

  return (
    <div className={`h-screen flex flex-col transition-colors duration-200 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Fixed Header Section */}
      <div className={`flex-shrink-0 ${isDarkMode ? 'bg-slate-900 border-b border-slate-800' : 'bg-white border-b border-gray-200'}`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Support Inbox</h1>
              <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Manage contact submissions and respond to user queries
              </p>
            </div>
            <button
              type="button"
              onClick={fetchContacts}
              disabled={loading}
              className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs transition-all duration-200 ${isDarkMode
                ? 'bg-pink-900/20 border-pink-700/50 text-pink-300 hover:bg-pink-900/30'
                : 'bg-pink-100 border-pink-300 text-pink-900 hover:bg-pink-200'
                } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="h-2 w-2 border-2 border-t-transparent border-current rounded-full animate-spin flex-shrink-0" />
              ) : (
                <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
              )}
              <span className="font-medium">{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto">
        {/* Stats Overview */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <div
                key={index}
                className={`rounded-xl p-5 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm border ${isDarkMode ? 'border-slate-700' : 'border-pink-100'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-6">
          <div className={`rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm border ${isDarkMode ? 'border-slate-700' : 'border-pink-100'
            }`}>
            {/* Tabs and Search */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {["all", "New", "Responded", "Closed"].map((tab) => {
                    const tabKey = tab.toLowerCase();
                    const count = tab === "all" ? stats.total : stats[tabKey] || 0;

                    return (
                      <button
                        key={tab}
                        onClick={() => setSelectedTab(tabKey)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${selectedTab === tabKey
                          ? isDarkMode
                            ? 'bg-pink-600 text-white'
                            : 'bg-pink-600 text-white'
                          : isDarkMode
                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {tab === "all" ? "All Messages" : tab}
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-black/10 dark:bg-white/10">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full md:w-64 pl-10 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 ${isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-pink-200 text-gray-900 placeholder-gray-500'
                      }`}
                  />
                  <svg
                    className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Messages List */}
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                  <p className={`mt-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Loading messages...</p>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-12">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-pink-100'} mb-4`}>
                    <MailIcon />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No messages found</h3>
                  <p className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>
                    {searchQuery ? "No messages match your search" : "No contact submissions yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.name}
                      className={`group rounded-xl p-5 transition-all duration-200 hover:shadow-md ${isDarkMode
                        ? 'bg-slate-700/50 hover:bg-slate-700 border border-slate-700'
                        : 'bg-white hover:bg-gray-50 border border-pink-100'
                        }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-600' : 'bg-pink-100'}`}>
                              <UserIcon />
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg">{contact.name_of_sender || "Unknown User"}</h3>
                                <StatusBadge status={contact.status} isDarkMode={isDarkMode} />
                              </div>
                              <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                {contact.email || "No email"}
                              </p>
                              <p className={`mt-3 line-clamp-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                {contact.message || "No message content"}
                              </p>
                              <div className="flex items-center gap-4 mt-4 text-sm">
                                <span className={`flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                  <ClockIcon />
                                  {formatDate(contact.created_at)}
                                </span>
                                {contact.responded_at && (
                                  <span className={`flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                    <MailIcon />
                                    Responded: {formatDate(contact.responded_at)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                          <button
                            onClick={() => handleOpenModal(contact)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isDarkMode
                              ? 'bg-slate-600 hover:bg-slate-500 text-white'
                              : 'bg-pink-600 hover:bg-pink-700 text-white'
                              }`}
                          >
                            {contact.status === "New" ? "Respond" : "View Details"}
                          </button>

                          <div className="flex gap-2">
                            {contact.status !== "Responded" && (
                              <button
                                onClick={() => handleUpdateStatus(contact.name, "Responded")}
                                disabled={saving}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isDarkMode
                                  ? 'bg-pink-900/30 hover:bg-pink-800/50 text-pink-300'
                                  : 'bg-pink-100 hover:bg-pink-200 text-pink-700'
                                  } disabled:opacity-50`}
                              >
                                Mark Responded
                              </button>
                            )}

                            {contact.status !== "Closed" && (
                              <button
                                onClick={() => handleUpdateStatus(contact.name, "Closed")}
                                disabled={saving}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isDarkMode
                                  ? 'bg-pink-900/30 hover:bg-pink-800/50 text-pink-300'
                                  : 'bg-pink-100 hover:bg-pink-200 text-pink-700'
                                  } disabled:opacity-50`}
                              >
                                Close
                              </button>
                            )}

                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(contact.email || "");
                                toast.success("Email copied to clipboard");
                              }}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isDarkMode
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600'
                                : 'bg-white hover:bg-gray-50 text-gray-700 border border-pink-200'
                                }`}
                            >
                              Copy Email
                            </button>
                          </div>
                        </div>
                      </div>

                      {contact.admin_response && (
                        <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-slate-600/50' : 'bg-pink-50'}`}>
                          <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                            Previous Response:
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                            {contact.admin_response}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Response Modal */}
      {isModalOpen && selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Manage Contact - {selectedContact.name_of_sender}</h2>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    {selectedContact.email}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-pink-100'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              <div className="mb-5">
                <label className="block text-sm font-medium mb-2">Current Status</label>
                <div className="flex gap-2">
                  {["New", "Responded", "Closed"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={saving || selectedStatus === status}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${selectedStatus === status
                        ? isDarkMode
                          ? 'bg-pink-600 text-white'
                          : 'bg-pink-600 text-white'
                        : isDarkMode
                          ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                          : 'bg-pink-100 hover:bg-pink-200 text-pink-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {status}
                      {selectedStatus === status && (
                        <CheckIcon className="inline ml-1.5 w-3.5 h-3.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium mb-2">Original Message</label>
                <div className={`p-3.5 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-pink-50 text-gray-700'}`}>
                  {selectedContact.message || "No message content"}
                </div>
              </div>

              {selectedStatus !== "Closed" && (
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2">
                    Your Response
                    {selectedContact.admin_response && (
                      <span className="ml-2 text-xs text-gray-500">(Editing previous response)</span>
                    )}
                  </label>
                  <textarea
                    rows={4}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response here..."
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 ${isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-pink-200 text-gray-900 placeholder-gray-500'
                      }`}
                  />

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Quick Responses</label>
                    <div className="flex flex-wrap gap-2">
                      {quickResponses.map((quickResponse, index) => (
                        <button
                          key={index}
                          onClick={() => setResponseText(quickResponse)}
                          className={`px-2.5 py-1 rounded-lg text-xs ${isDarkMode
                            ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                            : 'bg-pink-100 hover:bg-pink-200 text-pink-700'
                            }`}
                        >
                          {quickResponse.substring(0, 35)}...
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-200 dark:border-slate-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    Submitted: {formatDate(selectedContact.created_at)}
                  </span>
                  {selectedContact.responded_at && (
                    <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      Last Response: {formatDate(selectedContact.responded_at)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium ${isDarkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      : 'bg-pink-100 hover:bg-pink-200 text-pink-700'
                      }`}
                  >
                    Cancel
                  </button>

                  {selectedStatus !== "Closed" && (
                    <button
                      onClick={handleSendResponse}
                      disabled={saving || !responseText.trim()}
                      className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-pink-600 hover:bg-pink-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <span className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending...
                        </span>
                      ) : (
                        "Send Response"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupport;