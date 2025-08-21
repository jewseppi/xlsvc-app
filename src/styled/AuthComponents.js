// src/styled/AuthComponents.js
import styled from "styled-components";
import { Card, GlassCard } from "./BaseComponents";

export const AuthContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${(props) => props.theme.spacing.xl};
  background: radial-gradient(
      circle at 20% 80%,
      rgba(120, 119, 198, 0.3) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 20%,
      rgba(255, 119, 198, 0.3) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 40% 40%,
      rgba(120, 219, 255, 0.3) 0%,
      transparent 50%
    ),
    ${(props) => props.theme.colors.background.primary};
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
        45deg,
        transparent 30%,
        rgba(255, 255, 255, 0.01) 50%,
        transparent 70%
      ),
      linear-gradient(
        -45deg,
        transparent 30%,
        rgba(255, 255, 255, 0.01) 50%,
        transparent 70%
      );
    animation: shimmer 3s ease-in-out infinite;
  }

  @keyframes shimmer {
    0%,
    100% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
  }
`;

export const AuthCard = styled(GlassCard)`
  padding: ${(props) => props.theme.spacing.xxl};
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;

  @media (max-width: 480px) {
    padding: ${(props) => props.theme.spacing.xl};
    margin: ${(props) => props.theme.spacing.md};
  }
`;

export const AuthTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  color: ${(props) => props.theme.colors.text.primary};
  margin-bottom: ${(props) => props.theme.spacing.sm};
  background: ${(props) => props.theme.colors.gradient.accent};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
`;

export const AuthSubtitle = styled.p`
  text-align: center;
  color: ${(props) => props.theme.colors.text.secondary};
  margin-bottom: ${(props) => props.theme.spacing.xxl};
  font-size: 0.95rem;
  font-weight: 500;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

export const FormGroup = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.xl};
  position: relative;
`;

export const Alert = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.md};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  font-size: 0.875rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: ${(props) => props.theme.colors.accent.error};
  backdrop-filter: blur(10px);
`;

export const CenterText = styled.div`
  text-align: center;
  margin-top: ${(props) => props.theme.spacing.lg};
`;

export const FloatingLabel = styled.div`
  position: relative;

  input:focus + label,
  input:not(:placeholder-shown) + label {
    transform: translateY(-1.5rem) scale(0.8);
    color: ${(props) => props.theme.colors.accent.primary};
  }

  label {
    position: absolute;
    left: ${(props) => props.theme.spacing.md};
    top: 50%;
    transform: translateY(-50%);
    background: ${(props) => props.theme.colors.background.card};
    padding: 0 ${(props) => props.theme.spacing.sm};
    transition: ${(props) => props.theme.transitions.normal};
    pointer-events: none;
    color: ${(props) => props.theme.colors.text.muted};
    font-weight: 500;
  }
`;
