import React, { useEffect, useState } from 'react';
import { fetchLatestNPK, fetchHistoricalNPK } from '../services/thingSpeakService';
import { getCropPrediction } from '../services/predictService';
import './CropPrediction.css';


const CropPrediction = () => {
  const [npk, setNpk] = useState(null);
  const [crop, setCrop] = useState('');
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPopup, setShowPopup] = useState(false);


  useEffect(() => {
    const fetchAndPredict = async () => {
      try {
        setLoading(true);
        setError(null);
        const npkValues = await fetchLatestNPK();
        setNpk(npkValues);

        if (npkValues) {
          console.log('Fetched NPK values:', npkValues);
          const result = await getCropPrediction(npkValues.n, npkValues.p, npkValues.k, npkValues.temperature, npkValues.humidity, npkValues.ph);
          setCrop(result || 'No prediction available');
        } else {
          setError('Unable to fetch NPK values');
        }
      } catch (err) {
        setError('Error fetching data or prediction');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchHistory = async () => {
      try {
        setHistoryLoading(true);
        const historyData = await fetchHistoricalNPK();
        
        // Process history data with predictions
        const processedHistory = await Promise.all(
          historyData.map(async (item) => {
            const prediction = await getCropPrediction(item.n, item.p, item.k, item.temperature, item.humidity, item.ph);
            return {
              ...item,
              crop: prediction || 'Unknown'
            };
          })
        );

        setHistory(processedHistory);
      } catch (err) {
        console.error('History fetch error:', err);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchAndPredict();
    fetchHistory();
  }, []);

  // Crop icon mapping
  const getCropIcon = (cropName) => {
    const icons = {
      rice: '🌾',
      wheat: '🌿',
      maize: '🌽',
      cotton: '💮',
      sugarcane: '🍯',
      default: '🌱'
    };
    return icons[cropName?.toLowerCase()] || icons.default;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="app-container">
      {/* Dynamic Toolbar */}
      <nav className="toolbar">
        <div className="toolbar-background"></div>
        <div className="toolbar-content">
          <div className="logo-container">
          <div className="logo-icon">
  <img src="/assets/cropsight-logo.png" alt="CropSight Logo" />
</div>

           { /*<div className="logo-text">Crop<span>Sight</span></div>*/}
          </div>
        </div>
      </nav>
      
      {/* Animated Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Revolutionize Your Farm with <span className="highlight">CropSight</span></h1>
          <p>Unlock powerful soil insights and make smarter decisions to maximize every harvest.</p>
          <div className="hero-buttons">
          <button
  className="btn-primary"
  onClick={() =>
    document.getElementById("features").scrollIntoView({ behavior: "smooth" })
  }
>
  Get Started
</button>

<button className="btn-secondary" onClick={() => setShowPopup(true)}>
  Learn More
</button>

          </div>
        </div>
        <div className="hero-image">
          <div className="floating-icon icon-leaf">🍃</div>
          <div className="floating-icon icon-water">💧</div>
          <div className="floating-icon icon-sun">☀️</div>
          <div className="floating-icon icon-sprout">🌱</div>
          <div className="pulse-circle"></div>
        </div>
      </div>
      {showPopup && (
  <div className="image-popup">
    <div className="overlay" onClick={() => setShowPopup(false)}></div>
    <div className="popup-content">
      <img src="/assets/learnmore.png" alt="Learn More Info" />
      <button className="close-btn" onClick={() => setShowPopup(false)}>✕</button>
    </div>
  </div>
)}


      {/* Feature Overview */}
      <div id="features" className="feature-overview">
        <div className="feature-card">
          <div className="feature-icon">🔬</div>
          <h3>Soil Analysis</h3>
          <p>Real-time NPK measurements from IoT sensors</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🌾</div>
          <h3>Crop Recommendation</h3>
          <p>AI-powered crop suggestions based on soil data</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📈</div>
          <h3>Data Tracking</h3>
          <p>Monitor soil conditions over time</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🧪</div>
          <h3>Environmental Factors</h3>
          <p>Temperature, humidity, and pH monitoring</p>
        </div>
      </div>

      <div className="main-content">
        {/* Current Soil Analysis Dashboard */}
        <div className="dashboard-grid">
          {/* Main Analysis Card */}
          <div className="analysis-card main-card">
            <div className="card-header">
              <h2>Current Soil Analysis</h2>
              
              <div className="card-actions">
                {/* <button className="btn-refresh">↻ Refresh</button> */}
                <div className="data-badge">Live</div>
              </div>
            </div>
            
            {loading ? (
              <div className="loader-container">
                <div className="loader"></div>
                <p>Analyzing soil composition...</p>
              </div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <>
                <div className="npk-container">
                  <div className="npk-box nitrogen">
                    <div className="nutrient-icon">N</div>
                    <div className="nutrient-info">
                      <span className="nutrient-label">Nitrogen</span>
                      <span className="nutrient-value">{npk?.n}<small>mg/kg</small></span>
                    </div>
                    <div className="level-indicator">
                      <div className="level-bar" style={{width: `${Math.min(npk?.n / 2, 100)}%`}}></div>
                    </div>
                  </div>
                  <div className="npk-box phosphorus">
                    <div className="nutrient-icon">P</div>
                    <div className="nutrient-info">
                      <span className="nutrient-label">Phosphorus</span>
                      <span className="nutrient-value">{npk?.p}<small>mg/kg</small></span>
                    </div>
                    <div className="level-indicator">
                      <div className="level-bar" style={{width: `${Math.min(npk?.p / 2, 100)}%`}}></div>
                    </div>
                  </div>
                  <div className="npk-box potassium">
                    <div className="nutrient-icon">K</div>
                    <div className="nutrient-info">
                      <span className="nutrient-label">Potassium</span>
                      <span className="nutrient-value">{npk?.k}<small>mg/kg</small></span>
                    </div>
                    <div className="level-indicator">
                      <div className="level-bar" style={{width: `${Math.min(npk?.k / 2, 100)}%`}}></div>
                    </div>
                  </div>
                </div>

                <div className="environmental-factors">
                  <div className="gauge-container">
                    <div className="gauge temperature">
                      <div className="gauge-label">Temperature</div>
                      <div className="gauge-value">{npk?.temperature}°C</div>
                      {/* <div className="gauge-indicator" style={{transform: `rotate(${Math.min(npk?.temperature * 3, 180)}deg)`}}></div> */}
                    </div>
                    <div className="gauge humidity">
                      <div className="gauge-label">Humidity</div>
                      <div className="gauge-value">{npk?.humidity}%</div>
                      {/* <div className="gauge-indicator" style={{transform: `rotate(${npk?.humidity * 1.8}deg)`}}></div> */}
                    </div>
                    <div className="gauge ph">
                      <div className="gauge-label">pH Level</div>
                      <div className="gauge-value">{npk?.ph}</div>
                      {/* <div className="gauge-indicator" style={{transform: `rotate(${npk?.ph * 20}deg)`}}></div> */}
                    </div>
                  </div>
                </div>

                <div className="recommendation-card">
            <h2>Ideal Crop Recommendation</h2>
            {loading ? (
              <div className="loader-container small">
                <div className="loader"></div>
              </div>
            ) : (
              <div className="crop-recommendation">
                <div className="crop-display">
                  <div className="crop-icon-large">{getCropIcon(crop)}</div>
                  <div className="crop-details">
                    <h3 className="crop-name">{crop}</h3>
                    {/* <div className="crop-match"></div> */}
                  </div>
                </div>
              </div>
            )}
          </div>
              </>
            )}
          </div>
          

          {/* Crop Recommendation Card */}
          

          {/* Quick Stats Card */}

          {/* Tips Card */}
          
        </div>

        {/* History Section */}
        <div className="history-section" id="history">
          <div className="section-header">
            <h2>Previous Measurement Information</h2>
          </div>
          
          {historyLoading ? (
            <div className="loader-container">
              <div className="loader"></div>
              <p>Loading historical data...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="no-data">
              <div className="no-data-icon">📊</div>
              <h3>No Historical Data Available</h3>
              <p>Start collecting soil data to see your measurements history here</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date <span className="sort-icon">↓</span></th>
                    <th>N</th>
                    <th>P</th>
                    <th>K</th>
                    <th>Temperature</th>
                    <th>Humidity</th>
                    <th>pH</th>
                    <th>Recommended Crop</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, index) => (
                    <tr key={index} className={index === 0 ? 'latest-row' : ''}>
                      <td>{formatDate(entry.created_at)}</td>
                      <td>{entry.n}</td>
                      <td>{entry.p}</td>
                      <td>{entry.k}</td>
                      <td>{entry.temperature}°C</td>
                      <td>{entry.humidity}%</td>
                      <td>{entry.ph}</td>
                      <td>
                        <div className="table-crop">
                          <span className="table-crop-icon">{getCropIcon(entry.crop)}</span>
                          {entry.crop}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="newsletter-section">
        <div className="newsletter-content">
          <div className="newsletter-text">
            <h2>Stay Ahead in Farming</h2>
            <p>Subscribe for updates on soil care, crop advice, and modern farming tips.</p>
          </div>
          <div className="newsletter-form">
            <input type="email" className="newsletter-input" placeholder="Enter your email address" />
            <button className="newsletter-btn">Subscribe</button>
          </div>
        </div>
        <div className="newsletter-decoration">
          <div className="deco-circle circle-1"></div>
          <div className="deco-circle circle-2"></div>
          <div className="deco-circle circle-3"></div>
        </div>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-wave"></div>
        <div className="footer-content">
          <div className="footer-section about">
            <div className="footer-logo">
              <div className="logo-icon">🌱</div>
              <div className="logo-text"><span>Crop Sight</span></div>
            </div>
            <p>Cropsight revolutionizes farming through intelligent soil analysis, crop recommendation, and environmental monitoring.</p>

          </div>
          
          <div className="footer-section links">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#">Home</a></li>
            </ul>
          </div>
          
          <div className="footer-section links">
            <h3>Developers</h3>
            <ul className="footer-links">
              <li><span >Varshini</span></li>
              <li><span >Kingsy Shekena</span></li>
              <li><span >Priyadharshini</span></li>
            </ul>
          </div>

          {/* <div className="footer-section contact">
            <h3>Contact Us</h3>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <span>agrosense@gmail.com</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span>+91 6380554857</span>
              </div>
            </div>
          </div> */}
          
        </div>
        
        <div className="copyright">
          <p>© {new Date().getFullYear()} Cropsight. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CropPrediction;