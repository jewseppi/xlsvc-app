import styled from "styled-components";

export const FileInput = styled.input`
  width: 100%;
  padding: ${(props) => props.theme.spacing.xl};
  border: 2px dashed ${(props) => props.theme.colors.border.secondary};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  background: ${(props) => props.theme.colors.background.secondary};
  color: ${(props) => props.theme.colors.text.secondary};
  cursor: pointer;
  transition: ${(props) => props.theme.transitions.normal};
  font-size: 1rem;
  text-align: center;

  &:hover:not(:disabled) {
    border-color: ${(props) => props.theme.colors.accent.primary};
    background: ${(props) => props.theme.colors.background.tertiary};
    color: ${(props) => props.theme.colors.text.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::file-selector-button {
    background: ${(props) => props.theme.colors.gradient.button};
    color: ${(props) => props.theme.colors.text.primary};
    border: none;
    padding: ${(props) => props.theme.spacing.sm}
      ${(props) => props.theme.spacing.md};
    border-radius: ${(props) => props.theme.borderRadius.md};
    margin-right: ${(props) => props.theme.spacing.md};
    cursor: pointer;
    font-weight: 600;
    transition: ${(props) => props.theme.transitions.normal};
  }

  &::file-selector-button:hover {
    transform: translateY(-1px);
  }
`;

export const ProgressContainer = styled.div`
  margin-top: ${(props) => props.theme.spacing.lg};
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: ${(props) => props.theme.colors.background.secondary};
  border-radius: ${(props) => props.theme.borderRadius.full};
  overflow: hidden;
  position: relative;
  box-shadow: ${(props) => props.theme.shadows.inner};
`;

export const ProgressFill = styled.div`
  height: 100%;
  background: ${(props) => props.theme.colors.gradient.button};
  transition: width 0.3s ease;
  border-radius: ${(props) => props.theme.borderRadius.full};
  width: ${(props) => props.progress}%;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

export const ProgressText = styled.p`
  margin-top: ${(props) => props.theme.spacing.sm};
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.text.secondary};
  text-align: center;
  font-weight: 500;
`;
