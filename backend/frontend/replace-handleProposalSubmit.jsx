// PASTE THIS INSIDE THE EXISTING React component, replacing ONLY its
// handleProposalSubmit function. Your current JSX/CSS stays unchanged.
// Required existing component bindings in your project:
//   proposalForm, selectedPriorities, counts, selectedOptions,
//   setIsSubmittingProposal, setProposalStatus

const handleProposalSubmit = async (event) => {
  event.preventDefault();
  if (!selectedPriorities.length) {
    setProposalStatus({ type: "error", message: "Please select at least one service." });
    return;
  }

  const services = selectedPriorities.map((service) => ({
    id: service.id,
    title: service.title,
    type: service.type,
    label: service.type === "counter" ? service.label : "Selected Option",
    value:
      service.type === "counter"
        ? String(counts[service.id] ?? service.defaultValue ?? 1)
        : service.type === "simple"
          ? "Included"
          : selectedOptions[service.id] || "Not specified",
  }));

  setIsSubmittingProposal(true);
  setProposalStatus({ type: "", message: "" });

  try {
    const response = await fetch("/api/submit-proposal.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        fullName: proposalForm.fullName.trim(),
        phone: proposalForm.phone.trim(),
        email: proposalForm.email.trim(),
        services,
        website: "", // server-side spam honeypot
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Could not send your proposal request.");
    }
    setProposalStatus({
      type: "success",
      message: "Request sent successfully! Our team will contact you shortly.",
    });
  } catch (error) {
    setProposalStatus({
      type: "error",
      message: error instanceof Error ? error.message : "Unable to submit. Please try again.",
    });
  } finally {
    setIsSubmittingProposal(false);
  }
};
