/* ============================================================
   Mentor Wave CUET — api.js  (loads AFTER main.js)
   Handles all real backend API calls.
   ============================================================ */

const API_BASE = "http://localhost:5000/api";

// ── Storage helpers ──────────────────────────────────────────
function getToken()       { return localStorage.getItem("token"); }
function saveToken(t)     { localStorage.setItem("token", t); }
function removeToken()    { localStorage.removeItem("token"); }
function getUser()        { try { return JSON.parse(localStorage.getItem("currentUser") || "null"); } catch(e){ return null; } }
function saveUser(u)      { localStorage.setItem("currentUser", JSON.stringify(u)); }
function clearAuth()      { removeToken(); localStorage.removeItem("currentUser"); }

// ── Generic fetch ─────────────────────────────────────────────
async function apiFetch(endpoint, opts = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json",
    ...(token ? { Authorization: "Bearer " + token } : {}), ...(opts.headers||{}) };
  const res = await fetch(API_BASE + endpoint, { ...opts, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "HTTP " + res.status);
  return data;
}

// ── Notify helper ─────────────────────────────────────────────
function _notify(msg, type) {
  if (typeof showNotification === "function") showNotification(msg, type || "success");
  else console.log("[notify]", msg);
}

// ── Escape HTML ───────────────────────────────────────────────
function _esc(s) {
  if (typeof escapeHtml === "function") return escapeHtml(s);
  return String(s||"").replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ── Base path ─────────────────────────────────────────────────
function _base() {
  const p = window.location.pathname;
  return (p.includes("/tutor/")||p.includes("/guardian/")||p.includes("/admin/")) ? "../" : "";
}

function _redirectByRole(role) {
  const b = _base();
  if (role==="tutor")    window.location.href = b+"tutor/dashboard.html";
  else if (role==="guardian") window.location.href = b+"guardian/dashboard.html";
  else if (role==="admin")    window.location.href = b+"admin/dashboard.html";
  else window.location.href = b+"index.html";
}

// ═══════════════════════════════════════════════════════════════
//  LOGIN
// ═══════════════════════════════════════════════════════════════
async function handleLoginAPI(event) {
  event.preventDefault(); event.stopImmediatePropagation();
  const role = document.getElementById("role")?.value;
  const email = (document.getElementById("email")?.value||"").trim();
  const password = document.getElementById("password")?.value;
  const errDiv = document.getElementById("loginError");
  const showErr = m => { if(errDiv){errDiv.textContent=m;errDiv.style.display="block";} };
  if(errDiv) errDiv.style.display="none";
  if(!role)     { showErr("Please select your role."); return; }
  if(!email)    { showErr("Please enter your email."); return; }
  if(!password) { showErr("Please enter your password."); return; }
  if(role==="tutor" && !email.endsWith("@student.cuet.ac.bd")) {
    showErr("Tutors must use a @student.cuet.ac.bd email."); return; }
  const btn = event.target.querySelector('[type="submit"]');
  if(btn){btn.disabled=true;btn.textContent="Logging in...";}
  try {
    const data = await apiFetch("/auth/login", { method:"POST", body:JSON.stringify({email,password}) });
    if(data.user.role !== role) {
      clearAuth();
      showErr("This account is registered as '"+data.user.role+"', not '"+role+"'.");
      if(btn){btn.disabled=false;btn.textContent="Login";} return;
    }
    saveToken(data.token); saveUser(data.user);
    _notify("Login successful! Redirecting...");
    setTimeout(()=>_redirectByRole(data.user.role), 800);
  } catch(err) {
    // If needsVerification, redirect to verify page
    if(err.message && err.message.includes("verify")) {
      localStorage.setItem("pendingVerifyEmail", email);
      window.location.href = _base()+"verification.html"; return;
    }
    showErr(err.message||"Login failed.");
    if(btn){btn.disabled=false;btn.textContent="Login";}
  }
}

// ═══════════════════════════════════════════════════════════════
//  TUTOR REGISTRATION
// ═══════════════════════════════════════════════════════════════
async function handleTutorRegistrationAPI(event) {
  event.preventDefault(); event.stopImmediatePropagation();
  const fd = new FormData(event.target);
  const email=(fd.get("email")||"").trim(), name=(fd.get("name")||"").trim();
  const password=fd.get("password")||"", confirm=fd.get("confirmPassword")||"";
  const errDiv=document.getElementById("tutorRegisterError");
  const showErr=m=>{if(errDiv){errDiv.textContent=m;errDiv.style.display="block";}};
  if(errDiv) errDiv.style.display="none";
  if(!email.endsWith("@student.cuet.ac.bd")){showErr("Must use a valid @student.cuet.ac.bd email.");return;}
  if(password!==confirm){showErr("Passwords do not match.");return;}
  if(password.length<8){showErr("Password must be at least 8 characters.");return;}
  const btn=event.target.querySelector('[type="submit"]');
  if(btn){btn.disabled=true;btn.textContent="Registering...";}
  try {
    const data = await apiFetch("/auth/register",{method:"POST",body:JSON.stringify({
      name,email,password,role:"tutor",
      studentId:fd.get("studentId"),department:fd.get("department"),
      phone:fd.get("phone"),gender:fd.get("gender")
    })});
    localStorage.setItem("pendingVerifyEmail", email);
    if(data.devOtp) localStorage.setItem("devOtp", data.devOtp);
    _notify("Account created! Check your email for a verification code.");
    setTimeout(()=>{ window.location.href="verification.html"; },1000);
  } catch(err){
    showErr(err.message||"Registration failed.");
    if(btn){btn.disabled=false;btn.textContent="Register as Tutor";}
  }
}

// ═══════════════════════════════════════════════════════════════
//  GUARDIAN REGISTRATION
// ═══════════════════════════════════════════════════════════════
async function handleGuardianRegistrationAPI(event) {
  event.preventDefault(); event.stopImmediatePropagation();
  const fd=new FormData(event.target);
  const email=(fd.get("email")||"").trim(), name=(fd.get("name")||"").trim();
  const password=fd.get("password")||"", confirm=fd.get("confirmPassword")||"";
  const errDiv=document.getElementById("guardianRegisterError");
  const showErr=m=>{if(errDiv){errDiv.textContent=m;errDiv.style.display="block";}};
  if(errDiv) errDiv.style.display="none";
  if(password!==confirm){showErr("Passwords do not match.");return;}
  if(password.length<8){showErr("Password must be at least 8 characters.");return;}
  const btn=event.target.querySelector('[type="submit"]');
  if(btn){btn.disabled=true;btn.textContent="Registering...";}
  try {
    const gdata = await apiFetch("/auth/register",{method:"POST",body:JSON.stringify({
      name,email,password,role:"guardian",phone:fd.get("phone")
    })});
    localStorage.setItem("pendingVerifyEmail", email);
    if(gdata.devOtp) localStorage.setItem("devOtp", gdata.devOtp);
    _notify("Account created! Check your email for a verification code.");
    setTimeout(()=>{ window.location.href="verification.html"; },1000);
  } catch(err){
    showErr(err.message||"Registration failed.");
    if(btn){btn.disabled=false;btn.textContent="Register as Guardian";}
  }
}

// ═══════════════════════════════════════════════════════════════
//  EMAIL VERIFICATION PAGE
// ═══════════════════════════════════════════════════════════════
function initVerificationPageAPI() {
  const email = localStorage.getItem("pendingVerifyEmail") || "";
  const emailDisplay = document.getElementById("verifyEmail");
  if(emailDisplay) emailDisplay.textContent = email;

  const verifyForm = document.getElementById("verifyForm");
  const msgDiv = document.getElementById("verificationMessage");
  const resendBtn = document.getElementById("resendBtn");
  const devBtn = document.getElementById("devShowCode");

  const showMsg = (m, ok) => {
    if(!msgDiv) return;
    msgDiv.textContent = m;
    msgDiv.style.display = "block";
    msgDiv.style.color = ok ? "#27ae60" : "#e74c3c";
  };

  if(verifyForm) {
    const fresh = verifyForm.cloneNode(true);
    verifyForm.parentNode.replaceChild(fresh, verifyForm);
    fresh.addEventListener("submit", async e => {
      e.preventDefault();
      const code = (document.getElementById("verificationCode")?.value||"").trim();
      if(!code){showMsg("Please enter the verification code."); return;}
      const btn=fresh.querySelector('[type="submit"]');
      if(btn){btn.disabled=true;btn.textContent="Verifying...";}
      try {
        const data = await apiFetch("/auth/verify-otp",{method:"POST",body:JSON.stringify({email,otp:code})});
        saveToken(data.token); saveUser(data.user);
        localStorage.removeItem("pendingVerifyEmail");
        showMsg("Email verified! Redirecting...", true);
        setTimeout(()=>_redirectByRole(data.user.role), 1200);
      } catch(err) {
        showMsg(err.message||"Invalid code. Please try again.");
        if(btn){btn.disabled=false;btn.textContent="Verify Email";}
      }
    });
  }

  if(resendBtn) {
    resendBtn.addEventListener("click", async () => {
      resendBtn.disabled=true; resendBtn.textContent="Sending...";
      try {
        const data = await apiFetch("/auth/resend-otp",{method:"POST",body:JSON.stringify({email})});
        if(data.devOtp) {
          localStorage.setItem("devOtp", data.devOtp);
          if(devBtn) devBtn.dataset.otp = data.devOtp;
          showMsg("Email failed — click 'Show Demo Code' to get your code.", true);
        } else {
          showMsg("New code sent! Check your inbox.", true);
        }
      } catch(err) {
        showMsg(err.message||"Failed to resend.");
      }
      resendBtn.disabled=false; resendBtn.textContent="Resend Code";
    });
  }

  // Dev show code button (for when email isn't configured)
  if(devBtn) {
    devBtn.addEventListener("click", () => {
      const otp = devBtn.dataset.otp || localStorage.getItem("devOtp");
      if(otp) {
        const input=document.getElementById("verificationCode");
        if(input) { input.value=otp; }
        showMsg("Dev mode: Code '"+otp+"' filled in automatically. Click Verify.", true);
        localStorage.removeItem("devOtp");
      } else {
        showMsg("Click 'Resend Code' first to get a demo code.");
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════
//  LOGOUT
// ═══════════════════════════════════════════════════════════════
function handleLogoutAPI(event) {
  event.preventDefault();
  if(!confirm("Are you sure you want to logout?")) return;
  clearAuth();
  _notify("Logged out.");
  setTimeout(()=>{ window.location.href=_base()+"login.html"; },600);
}

// ═══════════════════════════════════════════════════════════════
//  BROWSE TUITIONS (tutor)
// ═══════════════════════════════════════════════════════════════
async function renderBrowseTuitionsAPI() {
  const container = document.getElementById("tuitionCards");
  if(!container) return;
  container.innerHTML='<p style="text-align:center;color:#999;padding:40px;">Loading tuition posts...</p>';
  try {
    const posts = await apiFetch("/tuition");
    if(!posts||!posts.length){
      container.innerHTML='<p style="text-align:center;color:#999;padding:40px;">No tuition posts available yet. Check back soon!</p>';
      return;
    }
    container.innerHTML = posts.map(t=>{
      const subs=Array.isArray(t.subjects)?t.subjects:(t.subjects?t.subjects.split(","):[]);
      return '<div class="tuition-card" data-id="'+t.id+'" data-class="'+_esc(t.class||"")+'" data-subject="'+_esc(subs[0]||"")+'" data-salary="'+(t.salary||0)+'">' +
        '<div class="tuition-header"><h3>'+_esc(t.title)+'</h3></div>' +
        '<div class="tuition-details">' +
          '<div class="detail-item"><span class="detail-icon">📚</span><span>Class '+_esc(t.class||"?")+" &bull; "+_esc(subs.join(", "))+'</span></div>'+
          '<div class="detail-item"><span class="detail-icon">📍</span><span>'+_esc(t.location||"")+'</span></div>'+
          '<div class="detail-item"><span class="detail-icon">💰</span><span>৳'+(t.salary||0)+'/month</span></div>'+
          '<div class="detail-item"><span class="detail-icon">📅</span><span>'+(t.days||"?")+'days/week</span></div>'+
        '</div>'+
        '<div class="tuition-description"><p>'+_esc(t.description||"")+'</p></div>'+
        '<div class="tuition-footer">'+
          '<small style="color:var(--sec-color,#666);">By '+(t.guardian?_esc(t.guardian.name):"Guardian")+'</small>'+
          '<button class="btn btn-primary btn-sm interested-btn" data-id="'+t.id+'">Show Interest</button>'+
        '</div></div>';
    }).join("");

    container.querySelectorAll(".interested-btn").forEach(btn=>{
      btn.addEventListener("click", async function(){
        const cu=getUser();
        if(!cu||!getToken()){_notify("Please login as a tutor.","error");return;}
        if(cu.role!=="tutor"){_notify("Only tutors can apply.","error");return;}
        this.disabled=true; this.textContent="Sending...";
        try {
          await apiFetch("/applications/apply/"+this.dataset.id,{method:"POST",body:JSON.stringify({message:""})});
          this.textContent="Interest Sent ✓";
          this.style.background="#27ae60";
          _notify("Interest sent to the guardian!");
        } catch(err){
          this.disabled=false; this.textContent="Show Interest";
          _notify(err.message||"Could not send interest.","error");
        }
      });
    });
    if(typeof filterTuitions==="function") filterTuitions();
  } catch(err){
    container.innerHTML='<p style="text-align:center;color:#e74c3c;padding:40px;">Could not load posts. Is the backend running?<br><small>'+_esc(err.message)+'</small></p>';
  }
}

// ═══════════════════════════════════════════════════════════════
//  POST TUITION FORM (guardian)
// ═══════════════════════════════════════════════════════════════
function initPostTuitionFormAPI() {
  const el=document.getElementById("postTuitionForm");
  if(!el) return;
  const fresh=el.cloneNode(true);
  el.parentNode.replaceChild(fresh,el);
  fresh.addEventListener("submit", async e=>{
    e.preventDefault(); e.stopImmediatePropagation();
    const subs=Array.from(fresh.querySelectorAll('input[name="subjects"]:checked')).map(s=>s.value);
    if(!subs.length){_notify("Please select at least one subject.","error");return;}
    const fd=new FormData(fresh);
    const payload={title:fd.get("title"),class:fd.get("class"),subjects:subs.join(","),
      location:fd.get("location"),salary:parseInt(fd.get("salary"))||0,
      days:parseInt(fd.get("days"))||0,description:fd.get("description")||""};
    const btn=fresh.querySelector('[type="submit"]');
    if(btn){btn.disabled=true;btn.textContent="Posting...";}
    try {
      await apiFetch("/tuition",{method:"POST",body:JSON.stringify(payload)});
      _notify("Tuition posted successfully!");
      setTimeout(()=>{window.location.href="dashboard.html";},1200);
    } catch(err){
      if(btn){btn.disabled=false;btn.textContent="Post Tuition";}
      _notify(err.message||"Failed to post.","error");
    }
  });
}

// ═══════════════════════════════════════════════════════════════
//  GUARDIAN DASHBOARD — my posts via /api/tuition/my
// ═══════════════════════════════════════════════════════════════
async function displayGuardianTuitionsAPI() {
  const postsGrid=document.querySelector(".posts-grid");
  if(!postsGrid) return;
  postsGrid.innerHTML='<p style="grid-column:1/-1;text-align:center;color:#999;padding:30px;">Loading your posts...</p>';
  try {
    const posts = await apiFetch("/tuition/my");
    if(!posts||!posts.length){
      postsGrid.innerHTML='<p style="grid-column:1/-1;text-align:center;color:#999;padding:30px;">No posts yet. <a href="post_tuition.html">Create your first post!</a></p>';
      return;
    }
    postsGrid.innerHTML=posts.map(p=>{
      const subs=Array.isArray(p.subjects)?p.subjects:(p.subjects?p.subjects.split(","):[]);
      const apvStatus=p.approvalStatus||"pending";
      const apvBadge=apvStatus==="approved"
        ?'<span style="font-size:11px;padding:3px 8px;border-radius:10px;background:#d4edda;color:#155724;font-weight:600;">✓ Approved</span>'
        :apvStatus==="declined"
        ?'<span style="font-size:11px;padding:3px 8px;border-radius:10px;background:#f8d7da;color:#721c24;font-weight:600;">✕ Declined</span>'
        :'<span style="font-size:11px;padding:3px 8px;border-radius:10px;background:#fff3cd;color:#856404;font-weight:600;">⏳ Pending Review</span>';
      const declineNote=apvStatus==="declined"&&p.declineReason
        ?'<div style="margin-top:8px;padding:8px 12px;background:#fff3cd;border-radius:6px;font-size:12px;color:#856404;border-left:3px solid #f39c12;"><strong>Admin note:</strong> '+_esc(p.declineReason)+'</div>'
        :"";
      return '<div class="post-card">'+
        '<div class="post-header"><h3>'+_esc(p.title)+'</h3>'+
          '<div style="display:flex;gap:6px;align-items:center;">'+
            apvBadge+
            '<span class="status-badge '+(p.status==="open"?"active":"inactive")+'">'+p.status+'</span>'+
          '</div></div>'+
        '<div class="post-details">'+
          '<div class="detail-item"><span>📚 Class '+_esc(p.class||"?")+" &bull; "+_esc(subs.join(", "))+'</span></div>'+
          '<div class="detail-item"><span>📍 '+_esc(p.location||"")+'</span></div>'+
          '<div class="detail-item"><span>💰 ৳'+(p.salary||0)+'/month &bull; '+(p.days||"?")+'days/week</span></div>'+
        '</div>'+
        declineNote+
        '<div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end;">'+
          (apvStatus==="approved"?'<button class="btn btn-primary btn-sm view-apps-btn" data-id="'+p.id+'">Applicants</button>':'')+
          '<button class="btn btn-danger btn-sm delete-post-btn" data-id="'+p.id+'">Delete</button>'+
        '</div></div>';
    }).join("");

    postsGrid.querySelectorAll(".view-apps-btn").forEach(btn=>{
      btn.addEventListener("click",function(){openApplicantsModal(this.dataset.id);});
    });
    postsGrid.querySelectorAll(".delete-post-btn").forEach(btn=>{
      btn.addEventListener("click", async function(){
        if(!confirm("Delete this tuition post?")) return;
        try {
          await apiFetch("/tuition/"+this.dataset.id,{method:"DELETE"});
          _notify("Post deleted.");
          displayGuardianTuitionsAPI();
        } catch(err){_notify(err.message||"Failed.","error");}
      });
    });
  } catch(err){
    postsGrid.innerHTML='<p style="grid-column:1/-1;text-align:center;color:#e74c3c;padding:30px;">'+_esc(err.message)+'</p>';
  }
}

// ═══════════════════════════════════════════════════════════════
//  APPLICANTS MODAL
// ═══════════════════════════════════════════════════════════════
function openApplicantsModal(postId) {
  const overlay=document.createElement("div");
  overlay.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;z-index:2000;";
  const box=document.createElement("div");
  box.style.cssText="background:white;padding:30px;border-radius:12px;width:560px;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);";
  box.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;"><h2 style="margin:0;">Applicants</h2><button id="closeAppsModal" style="background:none;border:none;font-size:26px;cursor:pointer;">&times;</button></div><div id="appsList"><p style="color:#999;">Loading...</p></div>';
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  box.querySelector("#closeAppsModal").addEventListener("click",()=>overlay.remove());
  overlay.addEventListener("click",e=>{if(e.target===overlay)overlay.remove();});
  loadApps(postId, box.querySelector("#appsList"));
}

async function loadApps(postId, container) {
  try {
    const apps = await apiFetch("/applications/post/"+postId);
    if(!apps||!apps.length){container.innerHTML='<p style="color:#999;text-align:center;padding:20px;">No applicants yet.</p>';return;}
    container.innerHTML=apps.map(app=>{
      const sc=app.status==="accepted"?"#d4edda":app.status==="rejected"?"#f8d7da":"#fff3cd";
      const tc=app.status==="accepted"?"#155724":app.status==="rejected"?"#721c24":"#856404";
      const dis=app.status!=="pending"?" disabled":"";
      return '<div style="padding:15px;border:1px solid #eee;border-radius:8px;margin-bottom:12px;">'+
        '<div style="display:flex;justify-content:space-between;">'+
          '<div><strong>'+_esc(app.tutor?app.tutor.name:"Unknown")+'</strong><br>'+
            '<small style="color:#888;">'+_esc(app.tutor?app.tutor.email:"")+'</small>'+
            (app.message?'<p style="font-size:13px;margin:6px 0;">&ldquo;'+_esc(app.message)+'&rdquo;</p>':"")+
          '</div>'+
          '<span style="font-size:12px;padding:3px 10px;border-radius:20px;background:'+sc+';color:'+tc+';font-weight:600;">'+
            (app.status||"pending")+'</span>'+
        '</div>'+
        '<div style="display:flex;gap:8px;margin-top:10px;">'+
          '<button class="btn btn-primary btn-sm accept-btn" data-id="'+app.id+'"'+dis+'>✓ Accept</button>'+
          '<button class="btn btn-danger btn-sm reject-btn" data-id="'+app.id+'"'+dis+'>✕ Decline</button>'+
          '<button class="btn btn-secondary btn-sm view-profile-btn" data-uid="'+(app.tutor?app.tutor.id:"")+'" data-name="'+_esc(app.tutor?app.tutor.name:"")+'" style="padding:4px 8px;font-size:12px;">👤 Profile</button>'+
          '<button class="btn btn-secondary btn-sm msg-btn" data-uid="'+(app.tutor?app.tutor.id:"")+'" data-name="'+_esc(app.tutor?app.tutor.name:"")+'" style="margin-left:auto;">💬 Message</button>'+
        '</div></div>';
    }).join("");

    container.querySelectorAll(".accept-btn").forEach(btn=>{
      btn.addEventListener("click",async()=>{
        if(!confirm("Accept this tutor? Post will close.")) return;
        try{await apiFetch("/applications/status/"+btn.dataset.id,{method:"PATCH",body:JSON.stringify({status:"accepted"})});
          _notify("Tutor accepted!");loadApps(postId,container);}
        catch(err){_notify(err.message||"Failed.","error");}
      });
    });
    container.querySelectorAll(".reject-btn").forEach(btn=>{
      btn.addEventListener("click",async()=>{
        if(!confirm("Decline this applicant?")) return;
        try{await apiFetch("/applications/status/"+btn.dataset.id,{method:"PATCH",body:JSON.stringify({status:"rejected"})});
          _notify("Applicant declined.");loadApps(postId,container);}
        catch(err){_notify(err.message||"Failed.","error");}
      });
    });
    container.querySelectorAll(".view-profile-btn").forEach(btn=>{
      btn.addEventListener("click",()=>{
        openTutorProfileModal(btn.dataset.uid, btn.dataset.name);
      });
    });
    container.querySelectorAll(".msg-btn").forEach(btn=>{
      btn.addEventListener("click",()=>{
        if(!btn.dataset.uid || btn.dataset.uid === "undefined" || btn.dataset.uid === "") {
          _notify("Cannot open message — tutor ID missing.", "error"); return;
        }
        localStorage.setItem("openChatWith", JSON.stringify({id:parseInt(btn.dataset.uid),name:btn.dataset.name}));
        // Navigate to messages.html — handle both guardian subfolder and root paths
        const p = window.location.pathname;
        if(p.includes("/guardian/") || p.includes("/tutor/") || p.includes("/admin/")) {
          window.location.href = "../messages.html";
        } else {
          window.location.href = "messages.html";
        }
      });
    });
  } catch(err){
    container.innerHTML='<p style="color:#e74c3c;">Error: '+_esc(err.message)+'</p>';
  }
}

// ═══════════════════════════════════════════════════════════════
//  MESSAGES PAGE — real conversations
// ═══════════════════════════════════════════════════════════════
let _activePartnerId = null;
let _pollInterval = null;

async function initMessagesPageAPI() {
  const cu = getUser();
  if(!cu||!getToken()){
    window.location.href="login.html"; return;
  }

  // Check if we should auto-open a specific chat (do this BEFORE loading convs so openChat isn't overridden)
  const openWith = localStorage.getItem("openChatWith");
  let forcedPartner = null;
  if(openWith) {
    try {
      forcedPartner = JSON.parse(openWith);
      localStorage.removeItem("openChatWith");
    } catch(e){}
  }

  await loadConversationsAPI(forcedPartner);

  // Message send handler - attach directly, no cloning needed here
  const form = document.getElementById("messageForm");
  if(form) {
    // Remove any old listeners by cloning
    const freshForm = form.cloneNode(true);
    form.parentNode.replaceChild(freshForm, form);
    freshForm.addEventListener("submit", async e=>{
      e.preventDefault();
      // Reference input from the fresh form directly
      const inputEl = freshForm.querySelector("#messageInput, .chat-input, textarea");
      const content = (inputEl?.value||"").trim();
      if(!content || !_activePartnerId) return;
      if(inputEl) inputEl.value = "";
      try {
        await apiFetch("/messages",{method:"POST",body:JSON.stringify({receiverId:_activePartnerId,content})});
        await loadMessagesAPI(_activePartnerId);
        // Scroll to bottom
        const chat=document.getElementById("chatMessages");
        if(chat) chat.scrollTop=chat.scrollHeight;
      } catch(err){ _notify(err.message||"Failed to send.","error"); }
    });
  }
}

async function loadConversationsAPI(forcedPartner) {
  const list = document.getElementById("conversationsList");
  if(!list) return;
  try {
    const convs = await apiFetch("/messages/conversations");
    if(!convs||!convs.length){
      list.innerHTML='<p style="text-align:center;color:#999;padding:20px;font-size:13px;">No conversations yet.<br>Send a message to start!</p>';
      // Still open forced partner chat even if no prior convs
      if(forcedPartner && forcedPartner.id) {
        openChat(String(forcedPartner.id), forcedPartner.name);
      }
      return;
    }
    const cu=getUser();
    list.innerHTML=convs.map(c=>{
      const p=c.partner;
      const initials=p.name.split(" ").map(n=>n[0]).join("").substring(0,2).toUpperCase();
      const lastMsg=c.messages[c.messages.length-1];
      const preview=lastMsg?lastMsg.content.substring(0,35)+(lastMsg.content.length>35?"...":""):"";
      const unread=c.unreadCount>0?'<span class="conv-time" style="background:#e74c3c;color:white;border-radius:10px;padding:2px 6px;font-size:11px;">'+c.unreadCount+'</span>':"";
      return '<div class="conversation-item" data-uid="'+p.id+'" data-name="'+_esc(p.name)+'" style="cursor:pointer;">'+
        '<div class="conv-avatar"><span>'+initials+'</span></div>'+
        '<div class="conv-content">'+
          '<div class="conv-header"><span class="conv-name">'+_esc(p.name)+'</span>'+unread+'</div>'+
          '<div class="conv-preview">'+_esc(preview)+'</div>'+
        '</div></div>';
    }).join("");

    list.querySelectorAll(".conversation-item").forEach(item=>{
      item.addEventListener("click",function(){
        list.querySelectorAll(".conversation-item").forEach(i=>i.classList.remove("active"));
        this.classList.add("active");
        openChat(this.dataset.uid, this.dataset.name);
      });
    });

    // Auto-open forced partner or first conversation
    if(forcedPartner && forcedPartner.id) {
      const fid = String(forcedPartner.id);
      const matchItem = list.querySelector('.conversation-item[data-uid="'+fid+'"]');
      if(matchItem) matchItem.classList.add("active");
      openChat(fid, forcedPartner.name);
    } else {
      const first=list.querySelector(".conversation-item");
      if(first&&!_activePartnerId){
        first.classList.add("active");
        openChat(first.dataset.uid, first.dataset.name);
      }
    }
  } catch(err){
    list.innerHTML='<p style="text-align:center;color:#e74c3c;padding:20px;font-size:13px;">'+_esc(err.message)+'</p>';
  }
}

function openChat(partnerId, partnerName) {
  // Always use string for dataset comparison, int for API calls
  _activePartnerId = String(partnerId);
  const nameEl=document.getElementById("activeChatName");
  const avatarEl=document.getElementById("activeChatAvatar");
  const statusEl=document.getElementById("activeChatStatus");
  if(nameEl) nameEl.textContent=partnerName||"Unknown";
  if(statusEl) statusEl.textContent="Mentor Wave CUET";
  if(avatarEl && partnerName) avatarEl.textContent=partnerName.split(" ").map(n=>n[0]).join("").substring(0,2).toUpperCase();
  // Reset chat area
  const chat=document.getElementById("chatMessages");
  if(chat){ chat.style.display=""; chat.innerHTML='<div style="text-align:center;color:#bbb;padding:40px;">Loading messages...</div>'; }
  loadMessagesAPI(_activePartnerId);
  // Poll for new messages every 5s
  if(_pollInterval) clearInterval(_pollInterval);
  _pollInterval=setInterval(()=>{ if(_activePartnerId) loadMessagesAPI(_activePartnerId); },5000);
}

async function loadMessagesAPI(partnerId) {
  const chat=document.getElementById("chatMessages");
  if(!chat) return;
  const cu=getUser();
  // Reset placeholder style when a chat is active
  chat.style.display="";
  chat.style.alignItems="";
  chat.style.justifyContent="";
  chat.style.color="";
  try {
    const msgs=await apiFetch("/messages/with/"+partnerId);
    const wasAtBottom=chat.scrollTop+chat.clientHeight>=chat.scrollHeight-10;
    if(!msgs.length){
      chat.innerHTML='<div style="text-align:center;color:#bbb;padding:40px;font-size:14px;">No messages yet.<br>Send a message to start the conversation!</div>';
    } else {
      chat.innerHTML=msgs.map(m=>{
        const isMine=m.senderId===cu.id;
        const time=new Date(m.createdAt).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
        return '<div class="message-group '+(isMine?"sent":"received")+'">'+
          '<div class="message '+(isMine?"sent":"received")+'">'+
            _esc(m.content)+'<span class="message-time">'+time+'</span>'+
          '</div></div>';
      }).join("");
    }
    if(wasAtBottom) chat.scrollTop=chat.scrollHeight;
  } catch(err){
    chat.innerHTML='<div style="text-align:center;color:#e74c3c;padding:20px;font-size:13px;">Could not load messages: '+_esc(err.message)+'</div>';
  }
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN DASHBOARD — nav filtering
// ═══════════════════════════════════════════════════════════════
//  ADMIN — POST APPROVALS TABLE
// ═══════════════════════════════════════════════════════════════
async function loadPostApprovalsTable() {
  const heading=document.querySelector(".section-heading");
  if(heading) heading.textContent="Tuition Post Approvals";

  const tbody=document.getElementById("usersTableBody");
  if(!tbody) return;
  tbody.innerHTML='<tr><td colspan="6" style="text-align:center;color:#999;padding:20px;">Loading posts...</td></tr>';

  try {
    const posts=await apiFetch("/admin/posts/pending");
    if(!posts||!posts.length){
      tbody.innerHTML='<tr><td colspan="6" style="text-align:center;color:#999;padding:20px;">No posts pending approval.</td></tr>';
      return;
    }
    tbody.innerHTML=posts.map(p=>{
      const subs=Array.isArray(p.subjects)?p.subjects:(p.subjects?p.subjects.split(","):[]);
      return '<tr>'+
        '<td><strong>'+_esc(p.title)+'</strong><br><small style="color:#888;">'+_esc(subs.join(", "))+'</small></td>'+
        '<td>Class '+_esc(p.class||"?")+'</td>'+
        '<td>'+_esc(p.guardian?p.guardian.name:"—")+'</td>'+
        '<td>৳'+( p.salary||0)+'/mo</td>'+
        '<td>'+_esc(p.location||"")+'</td>'+
        '<td style="white-space:nowrap;">'+
          '<button class="btn btn-primary btn-sm approve-post-btn" data-id="'+p.id+'" style="margin-right:6px;">✓ Approve</button>'+
          '<button class="btn btn-danger btn-sm decline-post-btn" data-id="'+p.id+'" data-title="'+_esc(p.title)+'">✕ Decline</button>'+
        '</td></tr>';
    }).join("");

    // Fix table header for posts
    const thead=document.querySelector(".data-table thead tr");
    if(thead){
      thead.innerHTML='<th>Post Title</th><th>Class</th><th>Guardian</th><th>Salary</th><th>Location</th><th>Actions</th>';
    }

    tbody.querySelectorAll(".approve-post-btn").forEach(btn=>{
      btn.addEventListener("click",async()=>{
        if(!confirm("Approve this tuition post? Tutors will be able to see and apply.")) return;
        try{
          await apiFetch("/admin/posts/"+btn.dataset.id+"/approve",{method:"PATCH"});
          _notify("Post approved! Tutors can now see it.");
          loadPostApprovalsTable();
          initAdminDashboardAPI();
        } catch(err){_notify(err.message||"Failed.","error");}
      });
    });

    tbody.querySelectorAll(".decline-post-btn").forEach(btn=>{
      btn.addEventListener("click",()=>{
        showDeclineReasonModal(btn.dataset.id, btn.dataset.title);
      });
    });
  } catch(err){
    tbody.innerHTML='<tr><td colspan="6" style="text-align:center;color:#e74c3c;padding:20px;">'+_esc(err.message)+'</td></tr>';
  }
}

function showDeclineReasonModal(postId, postTitle) {
  const overlay=document.createElement("div");
  overlay.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;z-index:3000;";
  const box=document.createElement("div");
  box.style.cssText="background:white;padding:30px;border-radius:12px;width:460px;box-shadow:0 20px 60px rgba(0,0,0,0.3);";
  box.innerHTML=
    '<h2 style="margin:0 0 8px;font-size:20px;color:#333;">Decline Post</h2>'+
    '<p style="color:#888;font-size:14px;margin-bottom:20px;">Declining: <strong>'+_esc(postTitle)+'</strong></p>'+
    '<label style="font-size:13px;font-weight:600;color:#555;display:block;margin-bottom:8px;">Reason for declining (guardian will see this):</label>'+
    '<textarea id="declineReasonInput" rows="4" style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;resize:vertical;" placeholder="e.g. Please provide more details about the subjects, class level, and location..."></textarea>'+
    '<div id="declineErrMsg" style="color:#e74c3c;font-size:13px;margin-top:8px;display:none;"></div>'+
    '<div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end;">'+
      '<button id="cancelDeclineBtn" style="padding:10px 20px;border:2px solid #ddd;background:white;border-radius:8px;cursor:pointer;font-weight:600;">Cancel</button>'+
      '<button id="confirmDeclineBtn" style="padding:10px 20px;background:#e74c3c;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Decline Post</button>'+
    '</div>';
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  box.querySelector("#cancelDeclineBtn").addEventListener("click",()=>overlay.remove());
  overlay.addEventListener("click",e=>{if(e.target===overlay)overlay.remove();});
  box.querySelector("#confirmDeclineBtn").addEventListener("click",async()=>{
    const reason=(box.querySelector("#declineReasonInput").value||"").trim();
    const errEl=box.querySelector("#declineErrMsg");
    if(!reason){errEl.textContent="Please enter a reason.";errEl.style.display="block";return;}
    const btn=box.querySelector("#confirmDeclineBtn");
    btn.disabled=true;btn.textContent="Declining...";
    try{
      await apiFetch("/admin/posts/"+postId+"/decline",{method:"PATCH",body:JSON.stringify({reason})});
      overlay.remove();
      _notify("Post declined. Guardian has been notified.");
      loadPostApprovalsTable();
      initAdminDashboardAPI();
    } catch(err){
      errEl.textContent=err.message||"Failed.";errEl.style.display="block";
      btn.disabled=false;btn.textContent="Decline Post";
    }
  });
}

// ═══════════════════════════════════════════════════════════════
async function initAdminDashboardAPI() {
  // Load stats and update badges
  try {
    const stats=await apiFetch("/admin/stats");
    const statMap={totalTutors:stats.tutors,totalGuardians:stats.guardians,totalPosts:stats.posts,totalMatches:stats.applications};
    Object.entries(statMap).forEach(([id,val])=>{ const el=document.getElementById(id); if(el) el.textContent=val||0; });
    // Update pending badges
    const pb=document.getElementById("pendingVerifBadge");
    if(pb){ if(stats.pendingUsers>0){pb.textContent=stats.pendingUsers;pb.style.display="";}else{pb.style.display="none";} }
    const ppb=document.getElementById("pendingPostsBadge");
    if(ppb){ if(stats.pendingPosts>0){ppb.textContent=stats.pendingPosts;ppb.style.display="";}else{ppb.style.display="none";} }
  } catch(e){console.warn("Stats error:",e.message);}

  // Load initial all-users table
  loadAdminTable("users","All Registered Users");

  // Wire nav buttons
  const navMap={
    "verificationsLink": {fn:()=>loadAdminTable("pending","Pending Verifications")},
    "postApprovalsLink": {fn:()=>loadPostApprovalsTable()},
    "tutorsLink":        {fn:()=>loadAdminTable("tutors","All Tutors")},
    "guardiansLink":     {fn:()=>loadAdminTable("guardians","All Guardians")},
  };
  Object.entries(navMap).forEach(([linkId,{fn}])=>{
    const link=document.getElementById(linkId);
    if(!link) return;
    link.addEventListener("click",e=>{
      e.preventDefault();
      document.querySelectorAll(".nav-item").forEach(n=>n.classList.remove("active"));
      link.classList.add("active");
      fn();
    });
  });

  // Dashboard link
  const dashLink=document.querySelector('.nav-item[href="dashboard.html"]');
  if(dashLink){
    dashLink.addEventListener("click",e=>{
      e.preventDefault();
      document.querySelectorAll(".nav-item").forEach(n=>n.classList.remove("active"));
      dashLink.classList.add("active");
      loadAdminTable("users","All Registered Users");
    });
  }
}

async function loadAdminTable(endpoint, title) {
  // Update section heading
  const heading=document.querySelector(".section-heading");
  if(heading) heading.textContent=title;

  // Reset table headers to user columns
  const thead=document.querySelector(".data-table thead tr");
  if(thead) thead.innerHTML='<th>Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Registered</th><th>Actions</th>';

  const tbody=document.getElementById("usersTableBody");
  if(!tbody) return;
  tbody.innerHTML='<tr><td colspan="5" style="text-align:center;color:#999;padding:20px;">Loading...</td></tr>';
  try {
    const users=await apiFetch("/admin/"+endpoint);
    if(!users||!users.length){
      tbody.innerHTML='<tr><td colspan="5" style="text-align:center;color:#999;padding:20px;">No records found.</td></tr>';
      return;
    }
    tbody.innerHTML=users.map(u=>{
      let delBtn;
      if(u.role==="admin") {
        delBtn='<span style="color:#999;font-size:12px;">Protected</span>';
      } else if(!u.isVerified) {
        delBtn='<button class="btn btn-primary btn-sm accept-user-btn" data-id="'+u.id+'" data-name="'+_esc(u.name)+'" style="margin-right:6px;">✓ Accept</button>'+
               '<button class="btn btn-danger btn-sm delete-user-btn" data-id="'+u.id+'" data-name="'+_esc(u.name)+'">Delete</button>';
      } else {
        delBtn='<button class="btn btn-danger btn-sm delete-user-btn" data-id="'+u.id+'" data-name="'+_esc(u.name)+'">Delete</button>';
      }
      const verified=u.isVerified
        ?'<span style="color:#27ae60;font-size:12px;">✓ Verified</span>'
        :'<span style="color:#e67e22;font-size:12px;">⏳ Pending</span>';
      return '<tr>'+
        '<td>'+_esc(u.name||"")+'</td>'+
        '<td>'+_esc(u.email||"")+'</td>'+
        '<td><span class="role-badge role-'+u.role+'">'+u.role+'</span></td>'+
        '<td>'+verified+'</td>'+
        '<td>'+new Date(u.createdAt).toLocaleDateString()+'</td>'+
        '<td>'+delBtn+'</td>'+
      '</tr>';
    }).join("");

    tbody.querySelectorAll(".accept-user-btn").forEach(btn=>{
      btn.addEventListener("click",async()=>{
        if(!confirm('Accept and verify "'+btn.dataset.name+'"?')) return;
        try{
          await apiFetch("/admin/users/"+btn.dataset.id+"/verify",{method:"PATCH"});
          _notify(btn.dataset.name+" has been verified successfully.");
          loadAdminTable(endpoint,title);
          const stats=await apiFetch("/admin/stats");
          ["totalTutors","totalGuardians","totalPosts","totalMatches"].forEach((id,i)=>{
            const el=document.getElementById(id);
            if(el) el.textContent=[stats.tutors,stats.guardians,stats.posts,stats.applications][i]||0;
          });
        } catch(err){_notify(err.message||"Failed.","error");}
      });
    });
    tbody.querySelectorAll(".delete-user-btn").forEach(btn=>{
      btn.addEventListener("click",async()=>{
        if(!confirm('Delete "'+btn.dataset.name+'"? This cannot be undone.')) return;
        try{
          await apiFetch("/admin/users/"+btn.dataset.id,{method:"DELETE"});
          _notify("User deleted.");
          loadAdminTable(endpoint,title);
          const stats=await apiFetch("/admin/stats");
          ["totalTutors","totalGuardians","totalPosts","totalMatches"].forEach((id,i)=>{
            const el=document.getElementById(id);
            if(el) el.textContent=[stats.tutors,stats.guardians,stats.posts,stats.applications][i]||0;
          });
        } catch(err){_notify(err.message||"Failed.","error");}
      });
    });
  } catch(err){
    tbody.innerHTML='<tr><td colspan="5" style="text-align:center;color:#e74c3c;padding:20px;">'+_esc(err.message)+'</td></tr>';
  }
}

// ═══════════════════════════════════════════════════════════════
//  TUTOR PROFILE
// ═══════════════════════════════════════════════════════════════
async function loadTutorProfileAPI() {
  try {
    const data = await apiFetch("/users/profile");
    saveUser(data);

    // Populate all fields with real data
    const fields = {
      profileName:    data.name,
      profileAvatar:  data.name ? data.name.split(" ").map(n=>n[0]).join("").substring(0,2).toUpperCase() : "??",
      profileDept:    data.department || "CUET",
      profileDeptSmall: data.department ? data.department+", CUET" : "CUET",
      profileStudentId: data.studentId ? "Student ID: "+data.studentId : "",
      profileEmail:   data.email,
      profilePhone:   data.phone || "Not provided",
      profileGender:  data.gender || "Not provided",
      userName:       data.name,
    };
    Object.entries(fields).forEach(([id,val])=>{
      const el=document.getElementById(id);
      if(el && val) el.textContent=val;
    });

    // Profile views
    const viewsEl = document.getElementById("profileViews");
    if(viewsEl) viewsEl.textContent = data.profileViews || 0;

    // Profile stat on profile page (stat-number)
    const statViews = document.querySelector(".stat-number");
    if(statViews) statViews.textContent = data.profileViews || 0;

    // TutorProfile data
    if(data.TutorProfile) {
      const tp = data.TutorProfile;
      const bioEl = document.getElementById("profileBio");
      if(bioEl) bioEl.textContent = tp.bio || "";
      const locEl = document.getElementById("profileLocation");
      if(locEl) locEl.textContent = tp.location || "";
    }

    if(typeof populateProfileFromCurrentUser==="function") populateProfileFromCurrentUser();
  } catch(err){
    console.warn("Profile API:",err.message);
    if(typeof populateProfileFromCurrentUser==="function") populateProfileFromCurrentUser();
  }
}

// Update admin table to have 6 columns (added Verified)
function fixAdminTableHeader() {
  const thead=document.querySelector(".data-table thead tr");
  if(thead&&thead.children.length===5){
    const th=document.createElement("th");
    th.textContent="Verified";
    thead.insertBefore(th, thead.children[3]);
  }
}

// ═══════════════════════════════════════════════════════════════
//  GUARDIAN DASHBOARD — stats + recent applicants
// ═══════════════════════════════════════════════════════════════
async function loadGuardianDashboardStatsAPI() {
  try {
    const posts = await apiFetch("/tuition/my");
    const activePosts = posts.filter(p=>p.status==="open").length;
    const el = document.getElementById("activePostsCount");
    if(el) el.textContent = activePosts;

    // Count total applicants across all posts
    let totalApplicants = 0, totalHired = 0;
    await Promise.all(posts.map(async p => {
      try {
        const apps = await apiFetch("/applications/post/"+p.id);
        totalApplicants += apps.length;
        totalHired += apps.filter(a=>a.status==="accepted").length;
      } catch(e){}
    }));
    const el2 = document.getElementById("interestedTutorsCount");
    if(el2) el2.textContent = totalApplicants;
    const el3 = document.getElementById("hiredCount");
    if(el3) el3.textContent = totalHired;

    // Message count
    try {
      const convs = await apiFetch("/messages/conversations");
      const unread = convs.reduce((sum,c)=>sum+(c.unreadCount||0),0);
      const el4 = document.getElementById("messageCount");
      if(el4) el4.textContent = unread;
      const badge = document.getElementById("msgNavBadge");
      if(badge){ if(unread>0){badge.textContent=unread;badge.style.display="";}else{badge.style.display="none";} }
    } catch(e){}

    // Also load the dashboard posts grid
    const grid = document.getElementById("dashboardPostsGrid");
    if(grid) {
      if(!posts.length){
        grid.innerHTML='<p style="color:#999;padding:20px;text-align:center;">No posts yet. <a href="post_tuition.html">Create your first tuition post!</a></p>';
      } else {
        grid.innerHTML = posts.slice(0,3).map(p=>{
          const subs=Array.isArray(p.subjects)?p.subjects:(p.subjects?p.subjects.split(","):[]);
          const apvStatus=p.approvalStatus||"pending";
          const apvLabel=apvStatus==="approved"?"✓ Approved":apvStatus==="declined"?"✕ Declined":"⏳ Pending";
          const apvColor=apvStatus==="approved"?"#27ae60":apvStatus==="declined"?"#e74c3c":"#e67e22";
          const declineNote=apvStatus==="declined"&&p.declineReason
            ?'<div style="margin:6px 0;padding:6px 10px;background:#fff3cd;border-radius:6px;font-size:11px;color:#856404;"><strong>Admin:</strong> '+_esc(p.declineReason)+'</div>':"";
          return '<div class="post-card">'+
            '<div class="post-header"><h3>'+_esc(p.title)+'</h3>'+
            '<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:#f0f0f0;color:'+apvColor+';font-weight:600;">'+apvLabel+'</span></div>'+
            '<div class="post-details">'+
              '<div class="detail-item"><span>📚 Class '+_esc(p.class||"?")+" &bull; "+_esc(subs.join(", "))+'</span></div>'+
              '<div class="detail-item"><span>📍 '+_esc(p.location||"")+'</span></div>'+
              '<div class="detail-item"><span>💰 ৳'+(p.salary||0)+'/month</span></div>'+
            '</div>'+
            declineNote+
            '<div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end;">'+
              (apvStatus==="approved"?'<button class="btn btn-primary btn-sm view-apps-dash-btn" data-id="'+p.id+'">Applicants</button>':'')+
              '<button class="btn btn-danger btn-sm del-post-dash-btn" data-id="'+p.id+'">Delete</button>'+
            '</div></div>';
        }).join("");
        grid.querySelectorAll(".view-apps-dash-btn").forEach(btn=>{
          btn.addEventListener("click",function(){openApplicantsModal(this.dataset.id);});
        });
        grid.querySelectorAll(".del-post-dash-btn").forEach(btn=>{
          btn.addEventListener("click",async function(){
            if(!confirm("Delete this post?")) return;
            try{ await apiFetch("/tuition/"+this.dataset.id,{method:"DELETE"}); _notify("Post deleted."); loadGuardianDashboardStatsAPI(); displayGuardianTuitionsAPI(); }
            catch(err){_notify(err.message||"Failed.","error");}
          });
        });
      }
    }
  } catch(err){console.warn("Guardian stats error:",err.message);}
}

async function loadRecentApplicantsAPI() {
  const tbody = document.getElementById("interestedTutorsList");
  if(!tbody) return;
  try {
    const apps = await apiFetch("/applications/recent");
    if(!apps||!apps.length){
      tbody.innerHTML='<tr><td colspan="4" style="text-align:center;color:#999;padding:20px;">No applicants yet.</td></tr>';
      return;
    }
    const cu = getUser();
    tbody.innerHTML = apps.map(app=>{
      const name = app.tutor ? app.tutor.name : "Unknown";
      const initials = name.split(" ").map(n=>n[0]).join("").substring(0,2).toUpperCase();
      const dept = app.tutor ? (app.tutor.department || "—") : "—";
      const when = new Date(app.createdAt).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
      const sc=app.status==="accepted"?"#27ae60":app.status==="rejected"?"#e74c3c":"#e67e22";
      const dis=app.status!=="pending"?" disabled":"";
      return '<tr>'+
        '<td><div style="display:flex;align-items:center;gap:10px;">'+
          '<div style="width:36px;height:36px;background:#A45A3F;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;">'+initials+'</div>'+
          '<div><strong>'+_esc(name)+'</strong><br><small style="color:#888;">'+_esc(dept)+'</small></div></div></td>'+
        '<td>'+_esc(dept)+'</td>'+
        '<td>'+when+'<br><small style="color:#888;">for: '+_esc(app.TuitionPost?app.TuitionPost.title:"")+'</small></td>'+
        '<td>'+
          '<div style="display:flex;gap:6px;align-items:center;">'+
            '<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:#f0f0f0;color:'+sc+';">'+app.status+'</span>'+
            '<button class="btn btn-primary btn-sm accept-recent-btn" data-id="'+app.id+'"'+dis+' style="padding:4px 8px;font-size:12px;">✓</button>'+
            '<button class="btn btn-danger btn-sm reject-recent-btn" data-id="'+app.id+'"'+dis+' style="padding:4px 8px;font-size:12px;">✕</button>'+
            '<button class="btn btn-info btn-sm view-profile-recent-btn" data-uid="'+(app.tutor?app.tutor.id:"")+'" data-name="'+_esc(name)+'" style="padding:4px 8px;font-size:12px;background:#5c9bd6;color:white;border:none;border-radius:6px;cursor:pointer;">👤</button>'+
            '<button class="btn btn-success btn-sm msg-recent-btn" data-uid="'+(app.tutor?app.tutor.id:"")+'" data-name="'+_esc(name)+'" style="padding:4px 8px;font-size:12px;background:#27ae60;color:white;border:none;border-radius:6px;cursor:pointer;">💬</button>'+
          '</div>'+
        '</td></tr>';
    }).join("");

    tbody.querySelectorAll(".accept-recent-btn").forEach(btn=>{
      btn.addEventListener("click",async()=>{
        if(!confirm("Accept this tutor?")) return;
        try{ await apiFetch("/applications/status/"+btn.dataset.id,{method:"PATCH",body:JSON.stringify({status:"accepted"})}); _notify("Tutor accepted!"); loadRecentApplicantsAPI(); loadGuardianDashboardStatsAPI(); }
        catch(err){_notify(err.message||"Failed.","error");}
      });
    });
    tbody.querySelectorAll(".reject-recent-btn").forEach(btn=>{
      btn.addEventListener("click",async()=>{
        if(!confirm("Decline this applicant?")) return;
        try{ await apiFetch("/applications/status/"+btn.dataset.id,{method:"PATCH",body:JSON.stringify({status:"rejected"})}); _notify("Applicant declined."); loadRecentApplicantsAPI(); }
        catch(err){_notify(err.message||"Failed.","error");}
      });
    });
    tbody.querySelectorAll(".view-profile-recent-btn").forEach(btn=>{
      btn.addEventListener("click",()=>{
        openTutorProfileModal(btn.dataset.uid, btn.dataset.name);
      });
    });
    tbody.querySelectorAll(".msg-recent-btn").forEach(btn=>{
      btn.addEventListener("click",()=>{
        if(!btn.dataset.uid || btn.dataset.uid === "undefined" || btn.dataset.uid === "") {
          _notify("Cannot open message — tutor ID missing.", "error"); return;
        }
        localStorage.setItem("openChatWith",JSON.stringify({id:parseInt(btn.dataset.uid),name:btn.dataset.name}));
        const p = window.location.pathname;
        if(p.includes("/guardian/") || p.includes("/tutor/") || p.includes("/admin/")) {
          window.location.href = "../messages.html";
        } else {
          window.location.href = "messages.html";
        }
      });
    });
  } catch(err){
    tbody.innerHTML='<tr><td colspan="4" style="text-align:center;color:#e74c3c;padding:20px;">'+_esc(err.message)+'</td></tr>';
  }
}

// ═══════════════════════════════════════════════════════════════
//  TUTOR DASHBOARD — real stats + applications
// ═══════════════════════════════════════════════════════════════
async function loadTutorDashboardAPI() {
  try {
    // Available tuitions count
    const posts = await apiFetch("/tuition");
    const el1 = document.getElementById("availableTuitions");
    if(el1) el1.textContent = posts.length;

    // My applications
    const apps = await apiFetch("/applications/my");
    const el2 = document.getElementById("appliedCount");
    if(el2) el2.textContent = apps.length;

    // Profile views — fetch from user profile
    try {
      const profile = await apiFetch("/users/profile");
      const el4 = document.getElementById("profileViews");
      if(el4) el4.textContent = profile.profileViews || 0;
    } catch(e){}

    // Message count
    try {
      const convs = await apiFetch("/messages/conversations");
      const unread = convs.reduce((sum,c)=>sum+(c.unreadCount||0),0);
      const el3 = document.getElementById("messageCount");
      if(el3) el3.textContent = unread;
      const badge = document.getElementById("msgNavBadge");
      if(badge){ if(unread>0){badge.textContent=unread;badge.style.display="";}else{badge.style.display="none";} }
    } catch(e){}

    // Load recent applications table
    const tbody = document.getElementById("recentApplications");
    if(tbody) {
      if(!apps.length){
        tbody.innerHTML='<tr><td colspan="6" style="text-align:center;color:#999;padding:20px;">No applications yet. <a href="browse.html">Browse tuitions</a> to apply.</td></tr>';
      } else {
        tbody.innerHTML = apps.slice(0,5).map(app=>{
          const post = app.TuitionPost;
          const subs = post ? (Array.isArray(post.subjects)?post.subjects:(post.subjects?post.subjects.split(","):[])) : [];
          const sc = app.status==="accepted"?"accepted":app.status==="rejected"?"rejected":"pending";
          const date = new Date(app.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
          return '<tr>'+
            '<td>'+_esc(post?subs[0]:"—")+'</td>'+
            '<td>'+_esc(post?post.class:"—")+'</td>'+
            '<td>'+_esc(post?post.location:"—")+'</td>'+
            '<td>৳'+((post&&post.salary)||0)+'/month</td>'+
            '<td><span class="status-badge '+sc+'">'+app.status+'</span></td>'+
            '<td>'+date+'</td>'+
          '</tr>';
        }).join("");
      }
    }
  } catch(err){ console.warn("Tutor dashboard error:",err.message); }
}

// ═══════════════════════════════════════════════════════════════
//  TUTOR PUBLIC PROFILE MODAL (for guardians)
// ═══════════════════════════════════════════════════════════════
async function openTutorProfileModal(tutorId, tutorName) {
  // Create overlay
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:3000;";
  const box = document.createElement("div");
  box.style.cssText = "background:white;border-radius:16px;width:560px;max-height:85vh;overflow-y:auto;box-shadow:0 25px 80px rgba(0,0,0,0.35);";
  box.innerHTML = '<div style="padding:24px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;"><h2 style="margin:0;font-size:20px;">Tutor Profile</h2><button id="closeProfileModal" style="background:none;border:none;font-size:26px;cursor:pointer;color:#666;line-height:1;">&times;</button></div><div id="tutorProfileContent" style="padding:24px;"><div style="text-align:center;color:#999;padding:30px;">Loading profile...</div></div>';
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  box.querySelector("#closeProfileModal").addEventListener("click",()=>overlay.remove());
  overlay.addEventListener("click",e=>{if(e.target===overlay)overlay.remove();});

  // Fetch tutor profile (increments view count server-side)
  try {
    const data = await apiFetch("/users/profile/tutor/"+tutorId);
    const u = data;
    const tp = u.TutorProfile || {};
    const initials = u.name.split(" ").map(n=>n[0]).join("").substring(0,2).toUpperCase();
    const subjects = tp.subjects ? tp.subjects.split(",").map(s=>'<span style="display:inline-block;padding:3px 10px;background:#f0f4ff;color:#4a6fa5;border-radius:12px;font-size:12px;margin:2px;">'+_esc(s.trim())+'</span>').join("") : '<em style="color:#bbb;">Not specified</em>';

    box.querySelector("#tutorProfileContent").innerHTML =
      '<div style="text-align:center;margin-bottom:24px;">'+
        '<div style="width:80px;height:80px;background:#A45A3F;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;margin:0 auto 12px;">'+initials+'</div>'+
        '<h3 style="margin:0 0 4px;font-size:22px;">'+_esc(u.name)+'</h3>'+
        '<p style="color:#A45A3F;font-weight:600;margin:0 0 4px;">'+_esc(u.department||"CUET Student")+'</p>'+
        (u.studentId?'<p style="color:#888;font-size:13px;margin:0;">Student ID: '+_esc(u.studentId)+'</p>':"")+
      '</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">'+
        '<div style="padding:14px;background:#f8f9fa;border-radius:10px;"><div style="font-size:12px;color:#888;margin-bottom:4px;">Email</div><div style="font-size:13px;font-weight:600;word-break:break-all;">'+_esc(u.email||"—")+'</div></div>'+
        '<div style="padding:14px;background:#f8f9fa;border-radius:10px;"><div style="font-size:12px;color:#888;margin-bottom:4px;">Phone</div><div style="font-size:13px;font-weight:600;">'+_esc(u.phone||"Not provided")+'</div></div>'+
        '<div style="padding:14px;background:#f8f9fa;border-radius:10px;"><div style="font-size:12px;color:#888;margin-bottom:4px;">Department</div><div style="font-size:13px;font-weight:600;">'+_esc(u.department||"—")+'</div></div>'+
        '<div style="padding:14px;background:#f8f9fa;border-radius:10px;"><div style="font-size:12px;color:#888;margin-bottom:4px;">Gender</div><div style="font-size:13px;font-weight:600;">'+_esc(u.gender||"—")+'</div></div>'+
      '</div>'+
      (tp.bio?'<div style="margin-bottom:20px;"><div style="font-size:13px;font-weight:700;color:#333;margin-bottom:8px;">About</div><p style="color:#555;font-size:14px;line-height:1.6;margin:0;padding:12px;background:#f8f9fa;border-radius:8px;">'+_esc(tp.bio)+'</p></div>':"") +
      '<div style="margin-bottom:20px;"><div style="font-size:13px;font-weight:700;color:#333;margin-bottom:8px;">Subjects</div><div>'+subjects+'</div></div>'+
      (tp.location?'<div style="margin-bottom:20px;"><div style="font-size:13px;font-weight:700;color:#333;margin-bottom:8px;">Preferred Location</div><p style="color:#555;font-size:14px;margin:0;">📍 '+_esc(tp.location)+'</p></div>':"") +
      '<div style="display:flex;gap:10px;margin-top:24px;padding-top:20px;border-top:1px solid #eee;">'+
        '<button id="msgFromProfileBtn" data-uid="'+_esc(String(u.id))+'" data-name="'+_esc(u.name)+'" style="flex:1;padding:12px;background:#A45A3F;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">💬 Send Message</button>'+
        '<button id="closeProfileBtn" style="padding:12px 20px;background:#f0f0f0;color:#666;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">Close</button>'+
      '</div>';

    box.querySelector("#msgFromProfileBtn").addEventListener("click",()=>{
      localStorage.setItem("openChatWith",JSON.stringify({id:parseInt(u.id),name:u.name}));
      overlay.remove();
      const p=window.location.pathname;
      if(p.includes("/guardian/")||p.includes("/tutor/")||p.includes("/admin/")){
        window.location.href="../messages.html";
      } else {
        window.location.href="messages.html";
      }
    });
    box.querySelector("#closeProfileBtn").addEventListener("click",()=>overlay.remove());
  } catch(err) {
    box.querySelector("#tutorProfileContent").innerHTML = '<div style="text-align:center;color:#e74c3c;padding:30px;">Could not load profile: '+_esc(err.message)+'</div>';
  }
}

// ═══════════════════════════════════════════════════════════════
//  WIRE UP on DOMContentLoaded
// ═══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", function() {
  const page=window.location.pathname.split("/").pop()||"index.html";
  const path=window.location.pathname;

  // LOGIN - clone removes main.js handler, then we attach ours
  if(page==="login.html"){
    const lf=document.getElementById("loginForm");
    if(lf){
      const fr=lf.cloneNode(true);
      lf.parentNode.replaceChild(fr,lf);
      fr.addEventListener("submit",handleLoginAPI);
    }
  }

  // REGISTER — attach submit handlers WITHOUT cloning (cloning destroys tab-switch listeners)
  if(page==="register.html"){
    // Handle URL param to pre-select tab (from homepage buttons)
    const roleParam = new URLSearchParams(window.location.search).get("role");
    if(roleParam === "guardian") {
      // Activate guardian tab
      document.querySelectorAll(".role-tab").forEach(t=>t.classList.remove("active"));
      const guardianTab = document.querySelector('.role-tab[data-role="guardian"]');
      if(guardianTab) guardianTab.classList.add("active");
      const tf=document.getElementById("tutorRegisterForm");
      const gf=document.getElementById("guardianRegisterForm");
      const ti=document.getElementById("tutorInfo");
      const gi=document.getElementById("guardianInfo");
      if(tf) tf.style.display="none";
      if(gf) gf.style.display="block";
      if(ti) ti.style.display="none";
      if(gi) gi.style.display="block";
    } else if(roleParam === "tutor") {
      document.querySelectorAll(".role-tab").forEach(t=>t.classList.remove("active"));
      const tutorTab = document.querySelector('.role-tab[data-role="tutor"]');
      if(tutorTab) tutorTab.classList.add("active");
      const tf=document.getElementById("tutorRegisterForm");
      const gf=document.getElementById("guardianRegisterForm");
      const ti=document.getElementById("tutorInfo");
      const gi=document.getElementById("guardianInfo");
      if(tf) tf.style.display="block";
      if(gf) gf.style.display="none";
      if(ti) ti.style.display="block";
      if(gi) gi.style.display="none";
    }

    // Attach submit handlers directly (no cloning)
    const tutorForm=document.getElementById("tutorRegisterForm");
    const guardianForm=document.getElementById("guardianRegisterForm");
    if(tutorForm) tutorForm.addEventListener("submit", handleTutorRegistrationAPI);
    if(guardianForm) guardianForm.addEventListener("submit", handleGuardianRegistrationAPI);
  }

  // VERIFICATION
  if(page==="verification.html") initVerificationPageAPI();

  // LOGOUT (all pages)
  const ll=document.getElementById("logoutLink");
  if(ll){const llr=ll.cloneNode(true);ll.parentNode.replaceChild(llr,ll);
    document.getElementById("logoutLink").addEventListener("click",handleLogoutAPI);}

  // TUTOR BROWSE
  if(page==="browse.html") setTimeout(renderBrowseTuitionsAPI,100);

  // TUTOR PROFILE
  if(page==="profile.html") setTimeout(loadTutorProfileAPI,100);

  // POST TUITION
  if(page==="post_tuition.html") setTimeout(initPostTuitionFormAPI,100);

  // GUARDIAN DASHBOARD
  if(page==="dashboard.html"&&path.includes("guardian")) {
    setTimeout(displayGuardianTuitionsAPI,150);
    setTimeout(loadGuardianDashboardStatsAPI,200);
    setTimeout(loadRecentApplicantsAPI,250);
  }

  // TUTOR DASHBOARD
  if(page==="dashboard.html"&&path.includes("tutor")) setTimeout(loadTutorDashboardAPI,150);

  // ADMIN DASHBOARD
  if(page==="dashboard.html"&&path.includes("admin")){
    fixAdminTableHeader();
    setTimeout(initAdminDashboardAPI,150);
  }

  // MESSAGES PAGE
  if(page==="messages.html") setTimeout(initMessagesPageAPI,100);
});
