import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { Button, Input, Label } from "../styled/BaseComponents";

const ProfilesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
`;

const ProfileSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.sm};
`;

const Select = styled.select`
  padding: ${(props) => props.theme.spacing.md};
  border: 2px solid ${(props) => props.theme.colors.border.primary};
  border-radius: ${(props) => props.theme.borderRadius.md};
  background: ${(props) => props.theme.colors.background.primary};
  color: ${(props) => props.theme.colors.text.primary};
  font-size: 0.875rem;
  width: 100%;

  &:focus {
    border-color: ${(props) => props.theme.colors.accent.primary};
    outline: none;
  }
`;

const ProfileActions = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
  flex-wrap: wrap;
`;

const SmallButton = styled(Button)`
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  font-size: 0.8rem;
`;

const ProfileForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.lg};
  border: 2px solid ${(props) => props.theme.colors.border.primary};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  background: ${(props) => props.theme.colors.background.secondary};
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const StatusMessage = styled.div`
  padding: ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.sm};
  font-size: 0.8rem;
  background: ${(props) =>
    props.error
      ? props.theme.colors.accent.error + "22"
      : props.theme.colors.accent.success + "22"};
  color: ${(props) =>
    props.error
      ? props.theme.colors.accent.error
      : props.theme.colors.accent.success};
`;

function FilterProfiles({
  apiBase,
  selectedProfileId,
  onSelectProfile,
  filterRules,
  setFilterRules,
  columnsToRemove,
  setColumnsToRemove,
  isAdmin,
}) {
  const [profiles, setProfiles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsTemplate, setFormIsTemplate] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${apiBase}/filter-profiles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfiles(response.data.profiles || []);
    } catch (err) {
      console.error("Error loading profiles:", err);
    }
  };

  const handleProfileChange = (e) => {
    const value = e.target.value;
    if (value === "manual") {
      onSelectProfile(null);
    } else {
      const profile = profiles.find((p) => p.id === parseInt(value));
      if (profile) {
        onSelectProfile(profile.id);
        setFilterRules(profile.filter_rules);
        setColumnsToRemove(profile.columns_to_remove || []);
      }
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${apiBase}/filter-profiles`,
        {
          name: formName.trim(),
          description: formDescription.trim(),
          filter_rules: filterRules,
          columns_to_remove: columnsToRemove,
          is_system_template: formIsTemplate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ text: "Profile saved!", error: false });
      setShowForm(false);
      setFormName("");
      setFormDescription("");
      setFormIsTemplate(false);
      loadProfiles();
    } catch (err) {
      setMessage({
        text: err.response?.data?.error || "Failed to save profile",
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    /* v8 ignore next -- button only rendered when selectedProfile exists */
    if (!selectedProfileId) return;
    const profile = profiles.find((p) => p.id === selectedProfileId);
    /* v8 ignore next -- defensive: profile always exists when button is shown */
    if (!profile) return;
    if (!window.confirm(`Delete profile "${profile.name}"?`)) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiBase}/filter-profiles/${selectedProfileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSelectProfile(null);
      loadProfiles();
      setMessage({ text: "Profile deleted", error: false });
    } catch (err) {
      setMessage({
        text: err.response?.data?.error || "Failed to delete profile",
        error: true,
      });
    }
  };

  const handleCloneProfile = async () => {
    /* v8 ignore next -- button only rendered when selectedProfile exists */
    if (!selectedProfileId) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${apiBase}/filter-profiles/${selectedProfileId}/clone`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ text: `Cloned as "${response.data.name}"`, error: false });
      loadProfiles();
    } catch (err) {
      setMessage({
        text: err.response?.data?.error || "Failed to clone profile",
        error: true,
      });
    }
  };

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  return (
    <ProfilesContainer>
      <ProfileSelector>
        <Label htmlFor="profile-select">Filter Profile</Label>
        <Select
          id="profile-select"
          value={selectedProfileId || "manual"}
          onChange={handleProfileChange}
        >
          <option value="manual">Manual Configuration</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.is_system_template ? "📋 " : ""}
              {p.name}
            </option>
          ))}
        </Select>
      </ProfileSelector>

      <ProfileActions>
        <SmallButton
          type="button"
          variant="ghost"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Save Current as Profile"}
        </SmallButton>
        {selectedProfile && selectedProfile.is_system_template && (
          <SmallButton type="button" variant="ghost" onClick={handleCloneProfile}>
            Clone to My Profiles
          </SmallButton>
        )}
        {selectedProfile &&
          (!selectedProfile.is_system_template || isAdmin) && (
            <SmallButton
              type="button"
              variant="danger"
              onClick={handleDeleteProfile}
            >
              Delete
            </SmallButton>
          )}
      </ProfileActions>

      {showForm && (
        <ProfileForm onSubmit={handleSaveProfile}>
          <FormRow>
            <Label htmlFor="profile-name">Profile Name</Label>
            <Input
              id="profile-name"
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g., Silver, Gold, Custom"
              maxLength={100}
              required
            />
          </FormRow>
          <FormRow>
            <Label htmlFor="profile-desc">Description (optional)</Label>
            <Input
              id="profile-desc"
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="What this profile does"
              maxLength={500}
            />
          </FormRow>
          {isAdmin && (
            <FormRow>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                <input
                  type="checkbox"
                  checked={formIsTemplate}
                  onChange={(e) => setFormIsTemplate(e.target.checked)}
                />
                Save as system template (visible to all users)
              </label>
            </FormRow>
          )}
          <SmallButton type="submit" variant="primary" disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </SmallButton>
        </ProfileForm>
      )}

      {message && (
        <StatusMessage error={message.error}>{message.text}</StatusMessage>
      )}
    </ProfilesContainer>
  );
}

export default FilterProfiles;
