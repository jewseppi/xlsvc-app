import React, { useState, useEffect } from "react";
import axios from "axios";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import { theme } from "./styled/theme";
import {
  AppContainer,
  LoadingContainer,
  Button,
  Input,
  Label,
} from "./styled/BaseComponents";
import {
  AuthContainer,
  AuthCard,
  AuthTitle,
  AuthSubtitle,
  Form,
  FormGroup,
  Alert,
  CenterText,
} from "./styled/AuthComponents";

// Global styles
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body, #root {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }

  body {
    background: ${(props) => props.theme.colors.background.primary};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${(props) => props.theme.colors.background.secondary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.colors.border.secondary};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${(props) => props.theme.colors.accent.primary};
  }
`;

// API Configuration
const API_BASE = "http://127.0.0.1:5000/api";

// Dashboard Components
const DashboardHeader = styled.header`
  background: ${(props) => props.theme.colors.background.card};
  backdrop-filter: blur(20px);
  border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
  padding: ${(props) => props.theme.spacing.lg} 0;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
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

const DashboardTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  background: ${(props) => props.theme.colors.gradient.accent};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
`;

const UserEmail = styled.span`
  color: ${(props) => props.theme.colors.text.secondary};
  font-size: 0.875rem;
  font-weight: 500;
`;

const MainContent = styled.main`
  max-width: 800px;
  margin: 0 auto;
  padding: ${(props) => props.theme.spacing.xl};
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
`;

const ContentCard = styled.div`
  background: ${(props) => props.theme.colors.gradient.card};
  border-radius: ${(props) => props.theme.borderRadius.xl};
  box-shadow: ${(props) => props.theme.shadows.lg};
  overflow: hidden;
  margin-bottom: ${(props) => props.theme.spacing.xl};
  border: 1px solid ${(props) => props.theme.colors.border.primary};
  backdrop-filter: blur(10px);
  width: 100%;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

const CardHeader = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
  border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
  background: rgba(255, 255, 255, 0.02);
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.text.primary};
  margin-bottom: ${(props) => props.theme.spacing.sm};
`;

const CardSubtitle = styled.p`
  color: ${(props) => props.theme.colors.text.secondary};
  font-size: 0.95rem;
`;

const CardBody = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
`;

const FileInput = styled.input`
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

const ProgressContainer = styled.div`
  margin-top: ${(props) => props.theme.spacing.lg};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: ${(props) => props.theme.colors.background.secondary};
  border-radius: ${(props) => props.theme.borderRadius.full};
  overflow: hidden;
  position: relative;
  box-shadow: ${(props) => props.theme.shadows.inner};
`;

const ProgressFill = styled.div`
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

const ProgressText = styled.p`
  margin-top: ${(props) => props.theme.spacing.sm};
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.text.secondary};
  text-align: center;
  font-weight: 500;
`;

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
`;

const FileItem = styled.div`
  padding: ${(props) => props.theme.spacing.lg};
  background: ${(props) => props.theme.colors.background.secondary};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid ${(props) => props.theme.colors.border.primary};
  transition: ${(props) => props.theme.transitions.normal};

  &:hover {
    background: ${(props) => props.theme.colors.background.tertiary};
    border-color: ${(props) => props.theme.colors.border.secondary};
    transform: translateY(-2px);
    box-shadow: ${(props) => props.theme.shadows.md};
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${(props) => props.theme.spacing.md};
  }
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
`;

const FileIcon = styled.div`
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

const FileDetails = styled.div`
  h4 {
    font-weight: 600;
    color: ${(props) => props.theme.colors.text.primary};
    margin-bottom: ${(props) => props.theme.spacing.xs};
    font-size: 1.1rem;
  }
`;

const FileMeta = styled.p`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.text.secondary};
  margin: 0;
`;

const Badge = styled.span`
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

const EmptyState = styled.div`
  text-align: center;
  padding: ${(props) => props.theme.spacing.xxl};
  color: ${(props) => props.theme.colors.text.tertiary};

  .icon {
    font-size: 3rem;
    margin-bottom: ${(props) => props.theme.spacing.md};
    opacity: 0.5;
  }
`;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUser(response.data);
        })
        .catch((error) => {
          console.error("Profile fetch error:", error);
          localStorage.removeItem("token");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <LoadingContainer>
          <div>Loading...</div>
        </LoadingContainer>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        {!user ? (
          <AuthPage setUser={setUser} />
        ) : (
          <Dashboard user={user} logout={logout} />
        )}
      </AppContainer>
    </ThemeProvider>
  );
}

function AuthPage({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "login" : "register";
      console.log(`Attempting ${endpoint} with:`, {
        email,
        endpoint: `${API_BASE}/${endpoint}`,
      });

      const response = await axios.post(`${API_BASE}/${endpoint}`, {
        email,
        password,
      });

      console.log("Auth response:", response.data);
      const { access_token } = response.data;
      localStorage.setItem("token", access_token);

      const profileResponse = await axios.get(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      console.log("Profile response:", profileResponse.data);
      setUser(profileResponse.data);
    } catch (err) {
      console.error("Auth error:", err);
      const errorMessage =
        err.response?.data?.error || err.message || "Something went wrong";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthTitle>Excel Processor</AuthTitle>
        <AuthSubtitle>
          {isLogin ? "Sign in to your account" : "Create a new account"}
        </AuthSubtitle>

        <Form onSubmit={handleSubmit}>
          {error && <Alert>{error}</Alert>}

          <FormGroup>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </FormGroup>

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Sign in" : "Sign up"}
          </Button>

          <CenterText>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </Button>
          </CenterText>
        </Form>
      </AuthCard>
    </AuthContainer>
  );
}

function Dashboard({ user, logout }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(response.data.files);
    } catch (err) {
      console.error("Error loading files:", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      alert("Please select an Excel file (.xlsx or .xls)");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      alert("File uploaded successfully!");
      loadFiles();
      e.target.value = "";
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed: " + (err.response?.data?.error || "Unknown error"));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      <DashboardHeader>
        <HeaderContent>
          <DashboardTitle>Excel Processor</DashboardTitle>
          <UserInfo>
            <UserEmail>Welcome, {user.email}</UserEmail>
            <Button variant="danger" small onClick={logout}>
              Logout
            </Button>
          </UserInfo>
        </HeaderContent>
      </DashboardHeader>

      <MainContent>
        <ContentCard>
          <CardHeader>
            <CardTitle>Upload Excel File</CardTitle>
            <CardSubtitle>Select .xlsx or .xls file (max 100MB)</CardSubtitle>
          </CardHeader>
          <CardBody>
            <FileInput
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={uploading}
            />

            {uploading && (
              <ProgressContainer>
                <ProgressBar>
                  <ProgressFill progress={uploadProgress} />
                </ProgressBar>
                <ProgressText>Uploading... {uploadProgress}%</ProgressText>
              </ProgressContainer>
            )}
          </CardBody>
        </ContentCard>

        <ContentCard>
          <CardHeader>
            <CardTitle>Your Files</CardTitle>
            <CardSubtitle>
              Uploaded Excel files ready for processing
            </CardSubtitle>
          </CardHeader>

          {files.length === 0 ? (
            <EmptyState>
              <div className="icon">📊</div>
              <p>No files uploaded yet</p>
              <p>Upload an Excel file to get started</p>
            </EmptyState>
          ) : (
            <CardBody>
              <FileList>
                {files.map((file) => (
                  <FileItem key={file.id}>
                    <FileInfo>
                      <FileIcon>XLS</FileIcon>
                      <FileDetails>
                        <h4>{file.original_filename}</h4>
                        <FileMeta>
                          {formatFileSize(file.file_size)} • Uploaded{" "}
                          {new Date(file.upload_date).toLocaleDateString()}
                        </FileMeta>
                      </FileDetails>
                    </FileInfo>
                    <div>
                      {file.processed ? (
                        <Badge>Processed</Badge>
                      ) : (
                        <Button
                          variant="primary"
                          small
                          onClick={() =>
                            alert("Processing feature coming soon!")
                          }
                        >
                          Process
                        </Button>
                      )}
                    </div>
                  </FileItem>
                ))}
              </FileList>
            </CardBody>
          )}
        </ContentCard>
      </MainContent>
    </>
  );
}

export default App;
