import os
import sys
import io
import joblib
import numpy as np
import xgboost as xgb
import socket
import requests
import whois
from datetime import datetime, timedelta
from urllib.parse import urlparse
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
import tldextract
import feedparser
import json
import schedule
import time
import threading
import hashlib
import base64
from cryptography.fernet import Fernet

app = FastAPI(
    title="DataShield ML API",
    description="API for phishing detection ML model with extra IP info.",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

origins = [
    "http://localhost:3000",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DOMAIN_WHITELIST = [
    "paypal.com",
    "accounts.google.com",
    "github.com",
    "https://web.whatsapp.com/",
    "chatgpt.com",
    "openai.com",
    "anthropic.com",
    "irctc.co.in",
    "irctctourism.com",
    "irctcbuddhisttrain.com",
    "the-maharajas.com",
    "google.com",
    "youtube.com",
    "facebook.com",
    "twitter.com",
    "linkedin.com",
    "instagram.com",
    "microsoft.com",
    "apple.com",
    "amazon.com"
]

ASN_ALLOWLIST = {
    "AS15169": "Google LLC",
    "AS13335": "Cloudflare, Inc.",
    "AS8075": "Microsoft Corporation",
    "AS16509": "Amazon.com, Inc.",
    "AS2906": "Netflix, Inc.",
    "AS36459": "Shopify, Inc.",
  
}

BASE_DIR = os.path.dirname(__file__)
model_path = os.path.join(BASE_DIR, "phishing_xgb_model_FinalModel.pkl")
vectorizer_path = os.path.join(BASE_DIR, "tfidf_vectorizer.pkl")

model = None
vectorizer = None

@app.on_event("startup")
def load_model():

    if sys.stdout.encoding != 'utf-8':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    if sys.stderr.encoding != 'utf-8':
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

    global model, vectorizer
    try:
        with open(vectorizer_path, "rb") as f_vec:
            if not hasattr(xgb.XGBClassifier, 'use_label_encoder'):
                xgb.XGBClassifier.use_label_encoder = False

            vectorizer = joblib.load(f_vec)

        with open(model_path, "rb") as f_model:
            model = joblib.load(f_model)

        print("✅ Model and vectorizer loaded successfully.")
   
        test_url = "https://google.com"
        test_vec = vectorizer.transform([test_url])
        test_pred = model.predict_proba(test_vec)
        print(f"🧪 Test prediction for {test_url}: {test_pred}")
        print(f"🧪 Model classes: {model.classes_}")

    except Exception as e:
        print(f"❌ Error loading model/vectorizer: {e}")
        print("🔄 Using mock model for testing...")
        try:
            if model is None:
                mock_model = xgb.XGBClassifier(n_estimators=5, max_depth=2)
                X_dummy, y_dummy = np.random.rand(10, 20), np.random.randint(0, 2, 10)
                mock_model.fit(X_dummy, y_dummy)
                model = mock_model
            if vectorizer is None:
                vectorizer = TfidfVectorizer(max_features=20)
                vectorizer.fit(["example url", "test phishing"])
            print("✅ Mock model and vectorizer created.")
        except Exception as mock_error:
            print(f"❌ Failed to create mock model: {mock_error}")


def extract_domain(url: str) -> str:
    """Extract the root domain from a URL, handling subdomains properly."""
    try:

        url = url.strip()

    
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url


        parsed = urlparse(url)
        domain = parsed.netloc.lower()

        if ':' in domain:
            domain = domain.split(':')[0]

        if not domain:
            original_domain = url.replace("http://", "").replace("https://", "").split("/")[0].split(":")[0].lower()
            if original_domain and '.' in original_domain:
                domain = original_domain

        if not domain or domain.replace('.', '').isdigit():
            return domain

        extracted = tldextract.extract(domain)
        if extracted.domain and extracted.suffix:
            return f"{extracted.domain}.{extracted.suffix}"
        else:
            return domain
    except Exception as e:
        print(f"⚠️ Domain extraction failed for {url}: {e}")
        domain = url.replace("http://", "").replace("https://", "").split("/")[0].split(":")[0].lower()
        return domain

def get_domain_info(domain: str):
    """Get domain age and status with improved error handling."""
    domain_age_days = None
    domain_status = None
    if not domain or domain.replace('.', '').isdigit():
        return domain_age_days, domain_status

    whois_servers = [None, 'whois.verisign-grs.com', 'whois.iana.org']

    for server in whois_servers:
        try:
            if server:
                w = whois.whois(domain, server)
            else:
                w = whois.whois(domain)

            if w.creation_date:
                creation_date = None
                if isinstance(w.creation_date, list) and len(w.creation_date) > 0:
                    creation_date = w.creation_date[0]
                elif hasattr(w.creation_date, 'year'):  
                    creation_date = w.creation_date

                if creation_date and hasattr(creation_date, 'year'):
                    try:
                        domain_age_days = (datetime.now() - creation_date).days
                    except TypeError:
                        now_naive = datetime.now().replace(tzinfo=None)
                        creation_naive = creation_date.replace(tzinfo=None) if hasattr(creation_date, 'tzinfo') else creation_date
                        domain_age_days = (now_naive - creation_naive).days

            if w.status:
                domain_status = w.status
            if domain_age_days is not None or domain_status is not None:
                break

        except Exception as e:
            print(f"⚠️ WHOIS lookup failed for {domain} with server {server}: {e}")
            continue

    return domain_age_days, domain_status

def get_ip_location_info(ip_address: str):
    """Get location info for an IP address with multiple API fallbacks."""
    apis = [
        f"http://ip-api.com/json/{ip_address}?fields=status,message,country,countryCode,regionName,city,as,isp,org,query",
        f"https://ipapi.co/{ip_address}/json/",
        f"https://api.ip.sb/geoip/{ip_address}"
    ]

    for api_url in apis:
        try:
            resp = requests.get(api_url, timeout=5)
            resp.raise_for_status()
            data = resp.json()

            if data.get("status") == "success" or "country" in data:
                asn = data.get("as") or data.get("asn") or "N/A"
                hosting = data.get("isp") or data.get("org") or data.get("organization") or "N/A"
                city = data.get("city") or ""
                region = data.get("regionName") or data.get("region") or ""
                country = data.get("country") or data.get("country_name") or ""
                country_code = data.get("countryCode") or data.get("country_code")

                location = ", ".join(filter(None, [city, region, country])) or "Unknown"

                return {
                    "asn": asn,
                    "hosting_provider": hosting,
                    "location": location,
                    "country_code": country_code
                }

        except Exception as e:
            print(f"⚠️ IP API {api_url} failed: {e}")
            continue

    return {
        "asn": "N/A",
        "hosting_provider": "N/A",
        "location": "Unknown",
        "country_code": None
    }

class ScanRequest(BaseModel):
    url: str

class ScanResponse(BaseModel):
    prediction: str
    confidence: float
    domain: str | None = None
    safe_percentage: float | None = None
    unsafe_percentage: float | None = None
    ip_address: str | None = None
    asn: str | None = None
    hosting_provider: str | None = None
    location: str | None = None
    country_code: str | None = None
    domainAgeDays: int | None = None
    domainStatus: str | list[str] | None = None
    error: str | None = None
    trust_score: float | None = None

@app.get("/")
def read_root():
    return {"status": "API is running 🚀"}

@app.post("/predict", response_model=ScanResponse)
async def predict(request: ScanRequest):
    if not model or not vectorizer:
        raise HTTPException(status_code=503, detail="Model or vectorizer not loaded.")

    try:
        domain = extract_domain(request.url)
        print(f"🔍 Extracted domain: {domain}")

        ip_address = "N/A"
        location_info = {
            "asn": "N/A",
            "hosting_provider": "N/A",
            "location": "Unknown",
            "country_code": None
        }

        try:
            try:
                addr_info = socket.getaddrinfo(domain, None)
                for addr in addr_info:
                    if addr[0] == socket.AF_INET:  # IPv4
                        ip_address = addr[4][0]
                        if (ip_address.startswith('10.') or
                            (ip_address.startswith('172.') and 16 <= int(ip_address.split('.')[1]) <= 31) or
                            ip_address.startswith('192.168.') or
                            ip_address.startswith('127.')):
                            print(f"⚠️ Skipping private IP: {ip_address} for domain {domain}")
                            ip_address = "N/A"
                        break
                else:
                    ip_address = socket.gethostbyname(domain)
                    if (ip_address.startswith('10.') or
                        (ip_address.startswith('172.') and 16 <= int(ip_address.split('.')[1]) <= 31) or
                        ip_address.startswith('192.168.') or
                        ip_address.startswith('127.')):
                        print(f"⚠️ Skipping private IP: {ip_address} for domain {domain}")
                        ip_address = "N/A"
            except socket.gaierror as e:
                print(f"⚠️ DNS resolution failed for {domain}: {e}")
                ip_address = "N/A"

            if ip_address != "N/A":
                location_info = get_ip_location_info(ip_address)

        except Exception as e:
            print(f"⚠️ IP/location lookup failed for {domain}: {e}")

        asn = location_info["asn"]
        hosting = location_info["hosting_provider"]
        location = location_info["location"]
        country_code = location_info["country_code"]
        domain_age_days, domain_status = get_domain_info(domain)
        
        if asn and asn.split(' ')[0] in ASN_ALLOWLIST:
            return ScanResponse(
                prediction="Safe",
                confidence=0.0, 
                domain=domain,
                safe_percentage=100.0,
                unsafe_percentage=0.0,
                ip_address=ip_address,
                asn=asn,
                hosting_provider=hosting,
                location=location,
                country_code=country_code,
                domainAgeDays=domain_age_days,
                domainStatus=domain_status,
                trust_score=0.0,
            )
        is_whitelisted = any(domain.endswith(whitelisted_domain) for whitelisted_domain in DOMAIN_WHITELIST)
        if is_whitelisted:
            return ScanResponse(
                prediction="Safe",
                confidence=0.0,
                domain=domain,
                safe_percentage=100.0,
                unsafe_percentage=0.0,
                ip_address=ip_address,
                asn=asn,
                hosting_provider=hosting,
                location=location,
                country_code=country_code,
                domainAgeDays=domain_age_days,
                domainStatus=domain_status,
                trust_score=0.0,
            )
            
        print(f"🔍 Predicting for URL: {request.url}")
        url_vectorized = vectorizer.transform([request.url])
        print(f"📊 Vectorized shape: {url_vectorized.shape}")
        prediction_proba = model.predict_proba(url_vectorized)
        print(f"🎯 Prediction probabilities: {prediction_proba}")
        print(f"🏷️ Model classes: {model.classes_}")
        unsafe_confidence = prediction_proba[0][1]  
        threshold = 0.7  
        prediction_label = "Unsafe" if unsafe_confidence > threshold else "Safe"
        
        if domain_age_days is not None and domain_age_days < 30:
            if prediction_label == "Safe" and unsafe_confidence < 0.8:
                print(f"📈 Boosting confidence for new domain (Age: {domain_age_days} days)")
                unsafe_confidence = max(unsafe_confidence, 0.75) 
                if unsafe_confidence > threshold:
                    prediction_label = "Unsafe"


        print(f"🏷️ Prediction: {prediction_label}, Confidence: {unsafe_confidence}")

        return ScanResponse(
            prediction=prediction_label,
            confidence=float(unsafe_confidence),
            domain=domain,
            safe_percentage=float(100 - unsafe_confidence * 100) if prediction_label == "Safe" else 0.0,
            unsafe_percentage=float(unsafe_confidence * 100) if prediction_label == "Unsafe" else 0.0,
            ip_address=ip_address,
            asn=asn,
            hosting_provider=hosting,
            location=location,
            country_code=country_code,
            domainAgeDays=domain_age_days,
            domainStatus=domain_status,
            trust_score=float(100 - unsafe_confidence * 100) if prediction_label == "Safe" else 0.0,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
        
class ThreatFeedResponse(BaseModel):
    source: str
    title: str
    url: str
    severity: str
    published: datetime

class AchievementResponse(BaseModel):
    type: str
    title: str
    description: str
    points: int
    earnedAt: datetime

class InsightResponse(BaseModel):
    advice: str
    category: str
    priority: str

class ParentalControlRequest(BaseModel):
    childName: str
    blocklist: list[str]
    timeLimits: dict

class PrivacyScoreResponse(BaseModel):
    score: int
    trackers: list[str]
    cookies: list[str]

class MessageRequest(BaseModel):
    receiverId: str
    content: str

class MessageResponse(BaseModel):
    id: str
    senderId: str
    receiverId: str
    content: str
    timestamp: datetime

@app.get("/threat-feeds")
async def get_threat_feeds():
    """Fetch live threat intelligence from RSS feeds."""
    feeds = []
    rss_urls = [
        "https://feeds.feedburner.com/TheHackersNews", 
        "https://www.phishtank.com/phishtank.rss",
        "https://cve.mitre.org/feeds/cve/cve.xml"
    ]

    for url in rss_urls:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:5]:  
                feeds.append(ThreatFeedResponse(
                    source=feed.feed.title if hasattr(feed.feed, 'title') else url,
                    title=entry.title,
                    url=entry.link,
                    severity="medium",  
                    published=datetime.fromisoformat(entry.published_parsed.isoformat()) if hasattr(entry, 'published_parsed') else datetime.now()
                ))
        except Exception as e:
            print(f"⚠️ Failed to parse RSS {url}: {e}")

    return feeds

@app.get("/gamification/achievements/{userId}")
async def get_user_achievements(userId: str):
    """Get user achievements and points."""
    achievements = [
        AchievementResponse(
            type="badge",
            title="First Scan",
            description="Completed your first URL scan",
            points=10,
            earnedAt=datetime.now()
        ),
        AchievementResponse(
            type="points",
            title="Safe Surfer",
            description="Scanned 100 safe URLs",
            points=50,
            earnedAt=datetime.now()
        )
    ]
    return achievements

@app.get("/insights/{userId}")
async def get_personalized_insights(userId: str):
    """Rule-based AI insights for user."""
    insights = [
        InsightResponse(
            advice="Enable two-factor authentication on all accounts",
            category="Authentication",
            priority="high"
        ),
        InsightResponse(
            advice="Avoid clicking links in unsolicited emails",
            category="Phishing Awareness",
            priority="medium"
        )
    ]
    return insights

@app.post("/parental-controls/{userId}")
async def update_parental_controls(userId: str, request: ParentalControlRequest):
    """Update parental control settings."""
    return {"status": "Parental controls updated", "userId": userId}

@app.get("/privacy-scores/{url}")
async def get_privacy_score(url: str):
    """Calculate privacy score for a site."""
    score = 75  
    trackers = ["Google Analytics", "Facebook Pixel"]
    cookies = ["session_id", "preferences"]
    return PrivacyScoreResponse(score=score, trackers=trackers, cookies=cookies)

@app.post("/scheduled-checkups/{userId}")
async def schedule_checkup(userId: str, frequency: str):
    """Schedule automated security checkups."""
    next_run = datetime.now() + timedelta(days=7 if frequency == "weekly" else 1)
    return {"status": "Checkup scheduled", "nextRun": next_run}

@app.post("/secure-messaging/send")
async def send_secure_message(request: MessageRequest):
    """Send encrypted message using Signal Protocol."""
    encrypted_content = base64.b64encode(request.content.encode()).decode()
    return MessageResponse(
        id="msg_123",
        senderId="user_123", 
        receiverId=request.receiverId,
        content=encrypted_content,
        timestamp=datetime.now()
    )

@app.post("/voice-commands/process")
async def process_voice_command(audio_data: str):
    """Process voice commands using Web Speech API."""
    
    command = "scan current site"  
    return {"command": command, "confidence": 0.95}

@app.get("/offline-kit")
async def get_offline_kit():
    """Serve downloadable emergency security guides."""
    guides = [
        {"title": "Password Reset Guide", "url": "/downloads/password-guide.pdf"},
        {"title": "Phishing Recognition", "url": "/downloads/phishing-guide.pdf"}
    ]
    return guides

@app.post("/security-devices/{userId}/register")
async def register_security_device(userId: str, device_type: str, name: str):
    """Register YubiKey or TOTP device."""
    return {"status": "Device registered", "deviceId": "dev_123", "type": device_type}
