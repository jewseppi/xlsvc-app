import styled from "styled-components";

export const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
`;

export const FileItem = styled.div`
  padding: ${(props) => props.theme.spacing.lg};
  background: ${(props) =>
    props.selected
      ? props.theme.colors.background.tertiary
      : props.theme.colors.background.secondary};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid
    ${(props) =>
      props.selected
        ? props.theme.colors.accent.primary
        : props.theme.colors.border.primary};
  transition: ${(props) => props.theme.transitions.normal};
  cursor: ${(props) => (props.onClick ? "pointer" : "default")};

  &:hover {
    background: ${(props) => props.theme.colors.background.tertiary};
    border-color: ${(props) =>
      props.selected
        ? props.theme.colors.accent.primary
        : props.theme.colors.border.secondary};
    transform: translateY(-2px);
    box-shadow: ${(props) => props.theme.shadows.md};
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${(props) => props.theme.spacing.md};
  }
`;

export const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
`;

export const FileIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${(props) => props.theme.colors.gradient.button};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 0.75rem;
  box-shadow: ${(props) => props.theme.shadows.md};
`;

export const FileDetails = styled.div`
  h4 {
    font-weight: 600;
    color: ${(props) => props.theme.colors.text.primary};
    margin-bottom: ${(props) => props.theme.spacing.xs};
    font-size: 1.1rem;
  }
`;

export const FileMeta = styled.p`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.text.secondary};
  margin: 0;
`;

export const FileName = styled.div`
  font-weight: 600;
  color: ${(p) => p.theme.colors.text.primary};
  margin-bottom: ${(p) => p.theme.spacing.xs};
  font-size: 1.1rem;

  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  display: inline-block;
  vertical-align: middle;
  position: relative;

  &:hover::after {
    content: attr(title);
    position: absolute;
    left: 0;
    top: 100%;
    background: ${(p) => p.theme.colors.background.card};
    color: ${(p) => p.theme.colors.text.primary};
    padding: 6px 10px;
    border-radius: ${(p) => p.theme.borderRadius.sm};
    white-space: normal;
    max-width: 400px;
    z-index: 10;
    box-shadow: ${(p) => p.theme.shadows.md};
  }
`;

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) => props.theme.colors.accent.success}22;
  color: ${(props) => props.theme.colors.accent.success};
  border: 1px solid ${(props) => props.theme.colors.accent.success}44;
`;
