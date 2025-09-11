import styled from "styled-components";

// Dashboard Layout Components
export const DashboardHeader = styled.header`
  background: ${(props) => props.theme.colors.background.card};
  backdrop-filter: blur(20px);
  border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
  padding: ${(props) => props.theme.spacing.lg} 0;
  position: sticky;
  top: 0;
  z-index: 100;
`;

export const HeaderContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 ${(props) => props.theme.spacing.md};
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: ${(props) => props.theme.spacing.md};
  }
`;

export const DashboardTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  background: ${(props) => props.theme.colors.gradient.accent};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
`;

export const UserEmail = styled.span`
  color: ${(props) => props.theme.colors.text.secondary};
  font-size: 0.875rem;
  font-weight: 500;
`;

export const MainContent = styled.main`
  max-width: 90%;
  margin: 0 auto;
  padding: ${(props) => props.theme.spacing.xl};
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
`;

export const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${(props) => props.theme.spacing.xl};
  width: 100%;
  max-width: 1400px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xl};
`;

export const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xl};
`;
