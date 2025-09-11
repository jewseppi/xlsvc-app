import styled from "styled-components";

export const ProcessingSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
`;

export const SelectedFileInfo = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  background: ${(props) => props.theme.colors.background.secondary};
  border-radius: ${(props) => props.theme.borderRadius.md};
  border: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const ProcessDescription = styled.p`
  color: ${(props) => props.theme.colors.text.secondary};
  font-size: 0.875rem;
  line-height: 1.5;
`;

export const ProcessingLog = styled.div`
  background: ${(props) => props.theme.colors.background.secondary};
  border-radius: ${(props) => props.theme.borderRadius.md};
  padding: ${(props) => props.theme.spacing.md};
  max-height: 200px;
  overflow-y: auto;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 0.875rem;
`;

export const LogEntry = styled.div`
  padding: ${(props) => props.theme.spacing.xs} 0;
  color: ${(props) =>
    props.error
      ? props.theme.colors.accent.error
      : props.theme.colors.text.secondary};
  border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};

  &:last-child {
    border-bottom: none;
  }
`;

export const DownloadSection = styled.div`
  margin-top: ${(props) => props.theme.spacing.lg};
  padding: ${(props) => props.theme.spacing.md};
  background: ${(props) => props.theme.colors.background.secondary};
  border-radius: ${(props) => props.theme.borderRadius.md};
  border: 1px solid ${(props) => props.theme.colors.accent.success}44;

  h4 {
    color: ${(props) => props.theme.colors.accent.success};
    margin-bottom: ${(props) => props.theme.spacing.sm};
  }

  p {
    color: ${(props) => props.theme.colors.text.secondary};
    margin: ${(props) => props.theme.spacing.xs} 0;
  }
`;

export const DownloadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${(props) => props.theme.spacing.md};
  margin-top: ${(props) => props.theme.spacing.md};
`;

export const DownloadCard = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  background: ${(props) => props.theme.colors.background.tertiary};
  border-radius: ${(props) => props.theme.borderRadius.md};
  border: 1px solid ${(props) => props.theme.colors.border.primary};

  h5 {
    color: ${(props) => props.theme.colors.text.primary};
    margin-bottom: ${(props) => props.theme.spacing.sm};
    font-size: 0.9rem;
  }

  p {
    font-size: 0.8rem;
    margin-bottom: ${(props) => props.theme.spacing.md};
  }
`;
