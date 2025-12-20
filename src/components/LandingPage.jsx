import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif', lineHeight: '1.6', color: '#1a1a2e', background: '#f8f9fa' }}>
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 20px;
          }

          /* Header */
          header {
            background: #1a1a2e;
            padding: 1rem 0;
          }

          header .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .logo {
            color: #fff;
            font-size: 1.5rem;
            font-weight: 700;
            text-decoration: none;
          }

          .logo span {
            color: #6366f1;
          }

          nav a {
            color: #fff;
            text-decoration: none;
            margin-left: 2rem;
            opacity: 0.9;
          }

          nav a:hover {
            opacity: 1;
          }

          /* Hero */
          .hero {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #fff;
            padding: 5rem 0;
            text-align: center;
          }

          .hero h1 {
            font-size: 3rem;
            margin-bottom: 1.5rem;
            line-height: 1.2;
          }

          .hero h1 span {
            color: #6366f1;
          }

          .hero p {
            font-size: 1.25rem;
            opacity: 0.9;
            max-width: 600px;
            margin: 0 auto 2rem;
          }

          .cta-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
          }

          .btn {
            display: inline-block;
            padding: 1rem 2rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1.1rem;
            transition: transform 0.2s, box-shadow 0.2s;
          }

          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          }

          .btn-primary {
            background: #6366f1;
            color: #fff;
          }

          .btn-secondary {
            background: transparent;
            color: #fff;
            border: 2px solid rgba(255,255,255,0.3);
          }

          /* Problem Section */
          .problem {
            padding: 4rem 0;
            background: #fff;
          }

          .problem h2 {
            text-align: center;
            font-size: 2rem;
            margin-bottom: 3rem;
          }

          .problem-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            align-items: center;
          }

          .problem-text h3 {
            color: #dc2626;
            font-size: 1.3rem;
            margin-bottom: 1rem;
          }

          .problem-text p {
            color: #666;
            margin-bottom: 1rem;
          }

          .solution-text h3 {
            color: #16a34a;
            font-size: 1.3rem;
            margin-bottom: 1rem;
          }

          .solution-text p {
            color: #666;
          }

          /* Features */
          .features {
            padding: 4rem 0;
            background: #f8f9fa;
          }

          .features h2 {
            text-align: center;
            font-size: 2rem;
            margin-bottom: 3rem;
          }

          .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
          }

          .feature-card {
            background: #fff;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }

          .feature-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
          }

          .feature-card h3 {
            margin-bottom: 0.5rem;
            font-size: 1.2rem;
          }

          .feature-card p {
            color: #666;
            font-size: 0.95rem;
          }

          /* How it Works */
          .how-it-works {
            padding: 4rem 0;
            background: #fff;
          }

          .how-it-works h2 {
            text-align: center;
            font-size: 2rem;
            margin-bottom: 3rem;
          }

          .steps {
            display: flex;
            justify-content: space-between;
            gap: 2rem;
            flex-wrap: wrap;
          }

          .step {
            flex: 1;
            min-width: 200px;
            text-align: center;
          }

          .step-number {
            width: 50px;
            height: 50px;
            background: #6366f1;
            color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: 700;
            margin: 0 auto 1rem;
          }

          .step h3 {
            margin-bottom: 0.5rem;
          }

          .step p {
            color: #666;
            font-size: 0.95rem;
          }

          /* Open Source */
          .open-source {
            padding: 4rem 0;
            background: #1a1a2e;
            color: #fff;
            text-align: center;
          }

          .open-source h2 {
            font-size: 2rem;
            margin-bottom: 1rem;
          }

          .open-source p {
            opacity: 0.9;
            max-width: 600px;
            margin: 0 auto 2rem;
          }

          /* Footer */
          footer {
            padding: 2rem 0;
            background: #0f0f1a;
            color: #fff;
            text-align: center;
          }

          footer p {
            opacity: 0.7;
            font-size: 0.9rem;
          }

          footer a {
            color: #6366f1;
            text-decoration: none;
          }

          /* Responsive */
          @media (max-width: 768px) {
            .hero h1 {
              font-size: 2rem;
            }

            .problem-grid {
              grid-template-columns: 1fr;
            }

            nav a {
              margin-left: 1rem;
              font-size: 0.9rem;
            }
          }
        `}
      </style>

      <header>
        <div className="container">
          <Link to="/" className="logo">Excel<span>Cleaner</span></Link>
          <nav>
            <a href="#features">Features</a>
            <a href="https://github.com/jewseppi/xlsvc" target="_blank">GitHub</a>
            <Link to="/app">Launch App</Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <h1>Clean Massive Excel Workbooks<br /><span>In One Click</span></h1>
          <p>Delete rows across multiple sheets with custom filter conditions. Preserves your images and formatting. Open source and free.</p>
          <div className="cta-buttons">
            <Link to="/app" className="btn btn-primary">Try It Free</Link>
            <a href="https://github.com/jewseppi/xlsvc" className="btn btn-secondary" target="_blank">View Source</a>
          </div>
        </div>
      </section>

      <section className="problem">
        <div className="container">
          <h2>The Problem We Solve</h2>
          <div className="problem-grid">
            <div className="problem-text">
              <h3>😤 The Manual Way</h3>
              <p>You have a 30-sheet workbook. You need to delete all rows where certain columns are empty.</p>
              <p>Excel's filter only works one sheet at a time. You spend an hour clicking through each sheet, filtering, deleting, repeating.</p>
              <p>Worse: if your sheets have images, most tools destroy them.</p>
            </div>
            <div className="solution-text">
              <h3>✨ With Excel Cleaner</h3>
              <p>Upload your workbook. Set your filter rules once. Click process.</p>
              <p>Every sheet is cleaned in seconds. Your images, charts, and formatting stay exactly where they were.</p>
              <p>Download your cleaned workbook. Done.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="container">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Multi-Sheet Processing</h3>
              <p>Apply your filter rules to every sheet in the workbook at once. No more clicking through tabs one by one.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Custom Filter Conditions</h3>
              <p>Set rules on any column. Delete rows where cells are empty, zero, or match specific values. Your rules, your data.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🖼️</div>
              <h3>Image Preservation</h3>
              <p>Unlike most tools, we preserve your embedded images, charts, and formatting. What you put in is what you get out.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast Processing</h3>
              <p>Powered by LibreOffice under the hood. Handles large workbooks with thousands of rows efficiently.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Deletion Reports</h3>
              <p>Get a detailed report of exactly which rows were deleted and why. Full audit trail for your records.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔓</div>
              <h3>Open Source</h3>
              <p>Fully open source. Self-host it for free, or use our hosted version. Inspect the code, trust the process.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Upload</h3>
              <p>Drop your Excel file (.xlsx or .xls)</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Configure</h3>
              <p>Set which columns and conditions to filter on</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Process</h3>
              <p>We clean all sheets and preserve your images</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Download</h3>
              <p>Get your cleaned workbook and deletion report</p>
            </div>
          </div>
        </div>
      </section>

      <section className="open-source">
        <div className="container">
          <h2>100% Open Source</h2>
          <p>Don't trust us with your data? Run it yourself. The entire codebase is available on GitHub. Self-host for free, or let us handle the infrastructure.</p>
          <a href="https://github.com/jewseppi/xlsvc" className="btn btn-primary" target="_blank">View on GitHub</a>
        </div>
      </section>

      <footer>
        <div className="container">
          <p>Built by <a href="https://jsilverman.ca" target="_blank">jsilverman</a> · <a href="https://github.com/jewseppi/xlsvc" target="_blank">GitHub</a></p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
