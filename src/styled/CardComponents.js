import styled from "styled-components";

export const ContentCard = styled.div`
  background: ${(props) => props.theme.colors.gradient.card};
  border-radius: ${(props) => props.theme.borderRadius.xl};
  box-shadow: ${(props) => props.theme.shadows.lg};
  overflow: hidden;
  margin-bottom: ${(props) => props.theme.spacing.xl};
  border: 1px solid ${(props) => props.theme.colors.border.primary};
  backdrop-filter: blur(10px);
  width: 100%;
  max-width: 40vw;
  margin-left: auto;
  margin-right: auto;
`;

export const CardHeader = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
  border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
  background: rgba(255, 255, 255, 0.02);
`;

export const CardTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.text.primary};
  margin-bottom: ${(props) => props.theme.spacing.sm};
`;

export const CardSubtitle = styled.p`
  color: ${(props) => props.theme.colors.text.secondary};
  font-size: 0.95rem;
`;

export const CardBody = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: ${(props) => props.theme.spacing.xxl};
  color: ${(props) => props.theme.colors.text.tertiary};

  .icon {
    font-size: 3rem;
    margin-bottom: ${(props) => props.theme.spacing.md};
    opacity: 0.5;
  }
`;
