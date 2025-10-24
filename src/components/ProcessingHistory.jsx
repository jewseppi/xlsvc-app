import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { Button } from "../styled/BaseComponents";

const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
`;

const HistoryItem = styled.div`
  background: ${(props) => props.theme.colors.background.secondary};
  border: 2px solid ${(props) => props.theme.colors.border.primary};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.lg};
  transition: ${(props) => props.theme.transitions.normal};

  &:hover {
    border-color: ${(props) => props.theme.colors.border.secondary};
  }
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const HistoryDate = styled.div`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

const HistoryDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.sm};
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const HistoryDetail = styled.div`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

const FilterRulesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${(props) => props.theme.spacing.sm};
  margin-top: ${(props) => props.theme.spacing.sm};
`;

const FilterRuleTag = styled.span`
  background: ${(props) => props.theme.colors.background.primary};
  color: ${(props) => props.theme.colors.accent.primary};
  padding: ${(props) => props.theme.spacing.xs}
    ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: 0.75rem;
  font-family: monospace;
`;

const EmptyState = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
  text-align: center;
  color: ${(props) => props.theme.colors.text.secondary};
  font-size: 0.875rem;
`;

const StatusBadge = styled.span`
  padding: ${(props) => props.theme.spacing.xs}
    ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) => {
    if (props.status === "completed") return "rgba(16, 185, 129, 0.1)";
    if (props.status === "failed") return "rgba(239, 68, 68, 0.1)";
    return "rgba(251, 191, 36, 0.1)";
  }};
  color: ${(props) => {
    if (props.status === "completed") return "#10b981";
    if (props.status === "failed") return "#ef4444";
    return "#fbbf24";
  }};
`;

function ProcessingHistory({ fileId, apiBase, onDownload }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (fileId) {
      loadHistory();
    }
  }, [fileId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get(`${apiBase}/files/${fileId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setHistory(response.data.history || []);
    } catch (err) {
      console.error("Error loading history:", err);
      setError("Failed to load processing history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <HistoryContainer>
        <EmptyState>Loading processing history...</EmptyState>
      </HistoryContainer>
    );
  }

  if (error) {
    return (
      <HistoryContainer>
        <EmptyState>{error}</EmptyState>
      </HistoryContainer>
    );
  }

  if (history.length === 0) {
    return (
      <HistoryContainer>
        <EmptyState>
          No processing history yet. Process this file to see results here.
        </EmptyState>
      </HistoryContainer>
    );
  }

  return (
    <HistoryContainer>
      {history.map((item) => (
        <HistoryItem key={item.job_id}>
          <HistoryHeader>
            <HistoryDate>📅 {formatDate(item.processed_at)}</HistoryDate>
            <StatusBadge status={item.status}>
              {item.status === "completed"
                ? "✅ Completed"
                : item.status === "failed"
                ? "❌ Failed"
                : "⏳ Processing"}
            </StatusBadge>
          </HistoryHeader>

          <HistoryDetails>
            {item.status === "completed" && (
              <>
                <HistoryDetail>
                  <strong>Rows Deleted:</strong>
                  {item.deleted_rows === 0 ? (
                    <span style={{ color: "#10b981" }}>
                      0 (File was clean! ✅)
                    </span>
                  ) : (
                    <span>{item.deleted_rows}</span>
                  )}
                </HistoryDetail>

                {item.filter_rules && item.filter_rules.length > 0 && (
                  <HistoryDetail>
                    <strong>Filters Applied:</strong>
                    <FilterRulesList>
                      {item.filter_rules.map((rule, idx) => (
                        <FilterRuleTag key={idx}>
                          {rule.column} = '{rule.value}'
                        </FilterRuleTag>
                      ))}
                    </FilterRulesList>
                  </HistoryDetail>
                )}

                {item.processed_filename && (
                  <HistoryDetail>
                    <strong>File:</strong> {item.processed_filename}
                  </HistoryDetail>
                )}
              </>
            )}

            {item.status === "failed" && (
              <HistoryDetail style={{ color: "#ef4444" }}>
                <strong>Error:</strong> Processing failed
              </HistoryDetail>
            )}
          </HistoryDetails>

          {item.status === "completed" && item.result_file_id && (
            <Button
              variant="primary"
              onClick={() =>
                onDownload(item.result_file_id, item.processed_filename)
              }
              style={{ width: "100%" }}
            >
              📥 Download Processed File
            </Button>
          )}
        </HistoryItem>
      ))}
    </HistoryContainer>
  );
}

export default ProcessingHistory;
