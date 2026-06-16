import React, { useState } from "react";
import styled from "styled-components";

const Section = styled.div`
  border: 1px solid ${(props) => props.theme.colors.border.primary};
  border-radius: ${(props) => props.theme.borderRadius.md};
  overflow: hidden;
`;

const Header = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${(props) => props.theme.spacing.sm};
  padding: ${(props) => props.theme.spacing.md};
  background: ${(props) => props.theme.colors.background.secondary};
  border: none;
  cursor: pointer;
  color: ${(props) => props.theme.colors.text.primary};
  font-size: 0.875rem;
  font-weight: 600;
  text-align: left;
`;

const Chevron = styled.span`
  transition: transform 0.15s ease;
  transform: rotate(${(props) => (props.$open ? "90deg" : "0deg")});
`;

const Body = styled.div`
  padding: ${(props) => props.theme.spacing.md};
`;

/**
 * A titled section that expands/collapses. `defaultOpen` controls the initial
 * state. Used to declutter the filter configuration UI.
 */
function CollapsibleSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Section>
      <Header
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <Chevron $open={open} aria-hidden="true">▶</Chevron>
      </Header>
      {open && <Body>{children}</Body>}
    </Section>
  );
}

export default CollapsibleSection;
