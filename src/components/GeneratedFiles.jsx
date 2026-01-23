import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { Button } from "../styled/BaseComponents";

const FilesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
`;

const FileTypeSection = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  background: ${(props) => props.theme.colors.background.secondary};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  border: 2px solid ${(props) => props.theme.colors.border.primary};
`;

const SectionTitle = styled.h4`
  color: ${(props) => props.theme.colors.text.primary};
  margin-bottom: ${(props) => props.theme.spacing.sm};
  font-size: 0.875rem;
  font-weight: 600;
`;

const FileItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.sm};
  background: ${(props) => props.theme.colors.background.primary};
  border-radius: ${(props) => props.theme.borderRadius.md};
  margin-top: ${(props) => props.theme.spacing.sm};
`;

const FileName = styled.div`
  color: ${(props) => props.theme.colors.text.secondary};
  font-size: 0.875rem;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: default;

  &:hover {
    overflow: visible;
    white-space: normal;
    word-break: break-all;
  }
`;

const EmptyState = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
  text-align: center;
  color: ${(props) => props.theme.colors.text.secondary};
  font-size: 0.875rem;
`;

function GeneratedFiles({ fileId, apiBase, onDownload }) {
  const [files, setFiles] = useState({
    macros: [],
    instructions: [],
    reports: [],
    processed: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (fileId) {
      loadFiles();
    }
  }, [fileId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${apiBase}/files/${fileId}/generated`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFiles(response.data);
    } catch (err) {
      console.error("Error loading generated files:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <EmptyState>Loading generated files...</EmptyState>;
  }

  const hasFiles =
    files.macros.length > 0 ||
    files.instructions.length > 0 ||
    files.reports.length > 0 ||
    files.processed.length > 0;

  if (!hasFiles) {
    return (
      <EmptyState>
        No generated files yet. Use "Generate Instructions & Macro" or
        "Automated Processing" to create files.
      </EmptyState>
    );
  }

  return (
    <FilesContainer>
      {files.macros.length > 0 && (
        <FileTypeSection>
          <SectionTitle>🖥️ Macros</SectionTitle>
          {files.macros.map((file) => (
            <FileItem key={file.id}>
              <FileName title={file.original_filename}>
                {file.original_filename}
              </FileName>
              <Button
                variant="primary"
                small
                onClick={() => onDownload(file.id, file.original_filename)}
              >
                Download
              </Button>
            </FileItem>
          ))}
        </FileTypeSection>
      )}

      {files.instructions.length > 0 && (
        <FileTypeSection>
          <SectionTitle>📋 Instructions</SectionTitle>
          {files.instructions.map((file) => (
            <FileItem key={file.id}>
              <FileName title={file.original_filename}>
                {file.original_filename}
              </FileName>
              <Button
                variant="secondary"
                small
                onClick={() => onDownload(file.id, file.original_filename)}
              >
                Download
              </Button>
            </FileItem>
          ))}
        </FileTypeSection>
      )}

      {files.reports.length > 0 && (
        <FileTypeSection>
          <SectionTitle>📊 Deletion Reports</SectionTitle>
          {files.reports.map((file) => (
            <FileItem key={file.id}>
              <FileName title={file.original_filename}>
                {file.original_filename}
              </FileName>
              <Button
                variant="secondary"
                small
                onClick={() => onDownload(file.id, file.original_filename)}
              >
                Download
              </Button>
            </FileItem>
          ))}
        </FileTypeSection>
      )}

      {files.processed.length > 0 && (
        <FileTypeSection>
          <SectionTitle>📥 Processed Files</SectionTitle>
          {files.processed.map((file) => (
            <FileItem key={file.id}>
              <FileName title={file.original_filename}>
                {file.original_filename}
              </FileName>
              <Button
                variant="primary"
                small
                onClick={() => onDownload(file.id, file.original_filename)}
              >
                Download
              </Button>
            </FileItem>
          ))}
        </FileTypeSection>
      )}
    </FilesContainer>
  );
}

export default GeneratedFiles;
