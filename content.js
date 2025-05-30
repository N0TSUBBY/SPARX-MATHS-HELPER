if (!document.getElementById('sparx-extension-popup')) {
  // Preload html2canvas immediately for faster response
  const html2canvasPromise = (function() {
    if (window.html2canvas) return Promise.resolve();
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    document.head.appendChild(script);
    return new Promise((resolve) => { script.onload = resolve; });
  })();
  
  // Create and style the popup
  const popup = document.createElement('div');
  popup.id = 'sparx-extension-popup';
  popup.innerHTML = `
    <style>
      #sparx-extension-popup {
        --primary-color: #4CAF50;
        --secondary-color: #2E7D32;
        --accent-color: #8BC34A;
        --text-color: #263238;
        --light-text: #546E7A;
        --bg-color: #ffffff;
        --border-color: rgba(0, 0, 0, 0.08);
        --shadow-color: rgba(0, 0, 0, 0.1);
        --header-height: 44px;
      }
      
      @media (prefers-color-scheme: dark) {
        #sparx-extension-popup {
          --primary-color: #66BB6A;
          --secondary-color: #388E3C;
          --text-color: #ECEFF1;
          --light-text: #B0BEC5;
          --bg-color: #1E1E1E;
          --border-color: rgba(255, 255, 255, 0.08);
          --shadow-color: rgba(0, 0, 0, 0.3);
        }
      }
      
      #sparx-extension-popup {
        position: fixed;
        z-index: 99999;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        color: var(--text-color);
        background: var(--bg-color);
        border-radius: 12px;
        box-shadow: 0 10px 25px var(--shadow-color);
        font-size: 14px;
        border: 1px solid var(--border-color);
        overflow: hidden;
        transform: translateY(0);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1);
        max-width: 95vw;
        max-height: 95vh;
        display: flex;
        flex-direction: column;
        resize: both;
        min-width: 300px;
        min-height: var(--header-height);
      }
      
      /* Desktop positioning */
      @media (min-width: 768px) {
        #sparx-extension-popup {
          top: 20px;
          right: 20px;
          width: 340px;
        }
      }
      
      /* Tablet positioning */
      @media (max-width: 767px) and (min-width: 481px) {
        #sparx-extension-popup {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 380px;
        }
      }
      
      /* Mobile positioning */
      @media (max-width: 480px) {
        #sparx-extension-popup {
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 40px);
          resize: none;
        }
      }
      
      .header {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        padding: 0 16px;
        height: var(--header-height);
        font-weight: 600;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        user-select: none;
        cursor: move;
      }
      
      .header-content {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        overflow: hidden;
      }
      
      .header h1 {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 0.3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .header-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));
      }
      
      .timer {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        padding: 2px 8px;
        font-size: 12px;
        font-family: 'Roboto Mono', monospace;
        margin-left: 8px;
        min-width: 50px;
        text-align: center;
      }
      
      .window-controls {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-left: 12px;
      }
      
      .window-btn {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        background: transparent;
        border: none;
        color: white;
      }
      
      .window-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .controls {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 16px;
        border-bottom: 1px solid var(--border-color);
      }
      
      .btn {
        flex: 1;
        padding: 10px;
        font-size: 13px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        touch-action: manipulation;
      }
      
      .btn-primary {
        background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
        color: white;
        box-shadow: 0 4px 6px rgba(76, 175, 80, 0.3);
      }
      
      .btn-primary:hover, .btn-primary:focus {
        background: linear-gradient(to right, #43A047, #1B5E20);
        transform: translateY(-2px);
        box-shadow: 0 6px 8px rgba(76, 175, 80, 0.4);
      }
      
      .btn-primary:active {
        transform: translateY(0);
      }
      
      .btn-secondary {
        background: rgba(0, 0, 0, 0.05);
        color: var(--text-color);
        border: 1px solid var(--border-color);
      }
      
      .btn-secondary:hover, .btn-secondary:focus {
        background: rgba(0, 0, 0, 0.08);
      }
      
      .content {
        padding: 16px;
        overflow-y: auto;
        flex: 1;
        -webkit-overflow-scrolling: touch;
      }
      
      .answer-container {
        background: rgba(76, 175, 80, 0.08);
        border-radius: 8px;
        padding: 14px;
        margin-bottom: 12px;
      }
      
      .answer-title {
        font-size: 12px;
        font-weight: 600;
        color: var(--primary-color);
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .answer-value {
        font-size: 18px;
        font-weight: 700;
        color: var(--text-color);
        margin: 8px 0;
        word-break: break-word;
      }
      
      .explanation-container {
        background: rgba(139, 195, 74, 0.05);
        border-radius: 8px;
        padding: 14px;
      }
      
      .explanation-title {
        font-size: 12px;
        font-weight: 600;
        color: var(--secondary-color);
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .explanation-text {
        font-size: 14px;
        line-height: 1.5;
        color: var(--text-color);
      }
      
      .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        text-align: center;
      }
      
      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(76, 175, 80, 0.2);
        border-radius: 50%;
        border-top-color: var(--primary-color);
        animation: spin 1s ease-in-out infinite;
        margin-bottom: 12px;
      }
      
      .loading-text {
        color: var(--light-text);
        font-size: 14px;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .minimized .content,
      .minimized .controls {
        display: none;
      }
      
      .minimized {
        height: var(--header-height) !important;
        width: 200px !important;
      }
      
      /* Mobile specific styles */
      @media (max-width: 480px) {
        .content {
          max-height: 200px;
        }
        
        .answer-value {
          font-size: 16px;
        }
        
        .explanation-text {
          font-size: 13px;
        }
        
        .minimized {
          width: 180px !important;
          bottom: 10px !important;
        }
      }
    </style>
    
    <div class="header">
      <div class="header-content">
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3 17L12 22L21 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3 12L12 17L21 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h1>Sparx Maths Solver</h1>
        <div class="timer" id="response-timer">0.0s</div>
      </div>
      <div class="window-controls">
        <button class="window-btn" id="minimize-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div class="controls">
      <button class="btn btn-primary" id="get-answer-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Get Answer
      </button>
      <button class="btn btn-secondary" id="clear-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Clear
      </button>
    </div>
    
    <div class="content" id="content-area">
      <div class="answer-container">
        <div class="answer-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 9H9.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15 9H15.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Answer
        </div>
        <div class="answer-value" id="answer-value">Will appear here (Made By S)</div>
      </div>
      
      <div class="explanation-container">
        <div class="explanation-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Explanation
        </div>
        <div class="explanation-text" id="explanation-text">Step-by-step explanation will appear here</div>
      </div>
    </div>
  `;
  document.body.appendChild(popup);
  
  // Cache DOM elements
  const elements = {
    answerValue: popup.querySelector('#answer-value'),
    explanationText: popup.querySelector('#explanation-text'),
    getAnswerBtn: popup.querySelector('#get-answer-btn'),
    clearBtn: popup.querySelector('#clear-btn'),
    contentArea: popup.querySelector('#content-area'),
    popup: popup,
    minimizeBtn: popup.querySelector('#minimize-btn'),
    timer: popup.querySelector('#response-timer'),
    header: popup.querySelector('.header')
  };
  
  // State management
  let isMinimized = false;
  let timerInterval = null;
  let startTime = 0;
  
  // Make popup draggable
  makeDraggable(popup, elements.header);
  
  // Optimized Gemini API call
  async function callGemini(promptText, imageBase64) {
    const API_KEY = '...';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    
    const requestBody = {
      contents: [{
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: imageBase64.split(',')[1]
            }
          },
          { text: promptText }
        ]
      }],
      generationConfig: {
        temperature: 0.1, // More deterministic answers
        topP: 0.95,
        topK: 40
      }
    };
    
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received";
    } catch (error) {
      console.error("Gemini API error:", error);
      throw error;
    }
  }
  
  // High-quality screenshot capture
  async function captureQuestion() {
    const questionDiv = document.querySelector('[class^="_QuestionWrapper_"]');
    if (!questionDiv) throw new Error("Couldn't find question container");
    
    return await html2canvas(questionDiv, {
      scale: 2, // High resolution capture
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      removeContainer: true,
      windowWidth: questionDiv.scrollWidth,
      windowHeight: questionDiv.scrollHeight
    });
  }
  
  // Show loading state
  function showLoading() {
    startTimer();
    elements.contentArea.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">Processing your question...</div>
      </div>
    `;
  }
  
  // Start response timer
  function startTimer() {
    startTime = Date.now();
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      elements.timer.textContent = `${elapsed.toFixed(1)}s`;
    }, 100);
  }
  
  // Stop response timer
  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }
  
  // Show error state
  function showError(message) {
    stopTimer();
    elements.contentArea.innerHTML = `
      <div class="answer-container">
        <div class="answer-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Error
        </div>
        <div class="answer-value">${message}</div>
      </div>
    `;
  }
  
  // Main answer processing flow
  async function getAnswer() {
    if (isMinimized) toggleMinimize(); // Auto-expand if minimized
    
    elements.getAnswerBtn.disabled = true;
    showLoading();
    
    try {
      await html2canvasPromise; // Ensure html2canvas is loaded
      
      const canvas = await captureQuestion();
      const imgData = canvas.toDataURL('image/png'); // Highest quality PNG
      
      // Get answer first
      const answer = await callGemini(
        "Provide only the exact numerical answer to this math problem without any additional text or explanation. " +
        "If the answer is a fraction, simplify it completely. " +
        "If the answer requires units, include them without additional text.",
        imgData
      );
      
      // Restore content area
      elements.contentArea.innerHTML = `
        <div class="answer-container">
          <div class="answer-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 9H9.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M15 9H15.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Answer
          </div>
          <div class="answer-value">${answer}</div>
        </div>
        
        <div class="explanation-container">
          <div class="explanation-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Explanation
          </div>
          <div class="explanation-text" id="explanation-text">Loading explanation...</div>
        </div>
      `;
      
      // Then get explanation (non-blocking)
      callGemini(
        `Explain how to solve this problem step-by-step in simple terms. The answer is ${answer}. ` +
        `Keep the explanation under 3 sentences.`,
        imgData
      ).then(explanation => {
        document.getElementById('explanation-text').textContent = explanation;
        stopTimer();
      }).catch(() => {
        document.getElementById('explanation-text').textContent = "Explanation unavailable";
        stopTimer();
      });
      
    } catch (error) {
      console.error("Error:", error);
      showError(error.message || "Processing failed");
    } finally {
      elements.getAnswerBtn.disabled = false;
    }
  }
  
  function clearResults() {
    stopTimer();
    elements.timer.textContent = '0.0s';
    elements.contentArea.innerHTML = `
      <div class="answer-container">
        <div class="answer-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 9H9.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15 9H15.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Answer
        </div>
        <div class="answer-value" id="answer-value">Will appear here</div>
      </div>
      
      <div class="explanation-container">
        <div class="explanation-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Explanation
        </div>
        <div class="explanation-text" id="explanation-text">Step-by-step explanation will appear here</div>
      </div>
    `;
  }
  
  // Toggle minimize/maximize
  function toggleMinimize() {
    isMinimized = !isMinimized;
    elements.popup.classList.toggle('minimized');
    
    // Update minimize button icon
    if (isMinimized) {
      elements.minimizeBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 15H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    } else {
      elements.minimizeBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    }
  }
  
  // Make element draggable
  function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;
    
    handle.onmousedown = dragMouseDown;
    handle.ontouchstart = dragTouchStart;
    
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // Get the mouse cursor position at startup
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // Call a function whenever the cursor moves
      document.onmousemove = elementDrag;
    }
    
    function dragTouchStart(e) {
      e = e || window.event;
      const touch = e.touches[0] || e.changedTouches[0];
      // Get the touch position at startup
      pos3 = touch.clientX;
      pos4 = touch.clientY;
      document.ontouchend = closeDragElement;
      // Call a function whenever the touch moves
      document.ontouchmove = elementTouchDrag;
    }
    
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      isDragging = true;
      // Calculate the new cursor position
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // Set the element's new position
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
      element.style.right = 'auto';
      element.style.bottom = 'auto';
      element.style.transform = 'none';
    }
    
    function elementTouchDrag(e) {
      e = e || window.event;
      const touch = e.touches[0] || e.changedTouches[0];
      e.preventDefault();
      isDragging = true;
      // Calculate the new touch position
      pos1 = pos3 - touch.clientX;
      pos2 = pos4 - touch.clientY;
      pos3 = touch.clientX;
      pos4 = touch.clientY;
      // Set the element's new position
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
      element.style.right = 'auto';
      element.style.bottom = 'auto';
      element.style.transform = 'none';
    }
    
    function closeDragElement() {
      // Stop moving when mouse button/touch is released
      document.onmouseup = null;
      document.onmousemove = null;
      document.ontouchend = null;
      document.ontouchmove = null;
      
      // If it was just a click (not a drag), don't toggle minimize
      if (!isDragging && (event.type === 'mouseup' || event.type === 'touchend')) {
        return;
      }
      
      isDragging = false;
    }
    
    // Prevent minimize when dragging
    handle.addEventListener('click', function(e) {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  }
  
  // Event listeners
  elements.getAnswerBtn.addEventListener('click', getAnswer);
  elements.clearBtn.addEventListener('click', clearResults);
  elements.minimizeBtn.addEventListener('click', toggleMinimize);
  
  // Touch event support for mobile
  elements.getAnswerBtn.addEventListener('touchstart', function(e) {
    e.preventDefault();
    this.classList.add('btn-primary-active');
  });
  
  elements.getAnswerBtn.addEventListener('touchend', function(e) {
    e.preventDefault();
    this.classList.remove('btn-primary-active');
    getAnswer();
  });
  
  elements.clearBtn.addEventListener('touchstart', function(e) {
    e.preventDefault();
    this.classList.add('btn-secondary-active');
  });
  
  elements.clearBtn.addEventListener('touchend', function(e) {
    e.preventDefault();
    this.classList.remove('btn-secondary-active');
    clearResults();
  });
}