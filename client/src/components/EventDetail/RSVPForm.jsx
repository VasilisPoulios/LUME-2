const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  
  // Validation check
  if (!user?.name || !user?.email || !formData.quantity) {
    setError("Name, email, and number of guests are required");
    return;
  }
  
  try {
    setLoading(true);
    
    if (!event?._id) {
      throw new Error("Event ID is missing. Please refresh the page.");
    }
    
    console.log(`Submitting RSVP for event: ${event._id}`);
    
    const result = await API.createRSVP(event._id, {
      name: user.name,
      email: user.email,
      phone: formData.phone,
      quantity: formData.quantity
    });
    
    console.log("RSVP submission result:", result);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    setSuccess(true);
    onSuccess();
    onClose();
  } catch (err) {
    console.error("RSVP error:", err);
    
    if (err.message?.includes("not found")) {
      setError("Event not found. Please refresh the page and try again.");
    } else {
      setError(err.message || "Failed to RSVP. Please try again.");
    }
  } finally {
    setLoading(false);
  }
}; 