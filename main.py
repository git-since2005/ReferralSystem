import os
from datetime import datetime, timedelta
from uuid import uuid4
from fastapi import FastAPI, HTTPException, Depends, Query, Request
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
import jwt
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder

load_dotenv()

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
client = AsyncIOMotorClient(os.getenv("uri"))
db = client["ReferralSystem"]
users = db["users"]
referrals = db['referrals']
history = db['history']
resets = db['resets']

JWT_SECRET = os.getenv("secret")
EMAIL_USER = os.getenv("user")
EMAIL_PASS = os.getenv("pass")
FRONTEND_URL = os.getenv("frontend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://referral-assessment.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)


@app.post("/register")
async def register(request: Request):
    body = await request.json()
    name = body.get("name")
    email = body.get("email")
    password = body.get("password").encode("utf-8")
    hashed_password = bcrypt.hashpw(password, bcrypt.gensalt(12))
    created_at = datetime.utcnow()
    user_id = str(uuid4())
    referrer = None
    referral_code = None or body.get("referral_code")

    if not name or not email or not password:
        return JSONResponse({"status":"Fill all details"}, status_code=400)

    if referral_code:
        isReferred = await referrals.find_one({"code":referral_code})
        if not isReferred:
            return JSONResponse({"status":"expired"}, status_code=400)
        else:
            await referrals.update_one({"code":referral_code}, {"$inc":{"count":1}})
            find = await referrals.find_one({"code":referral_code})
            referrer = find['user']
            if find['target'] == find['count']:
                await referrals.update_one({"code":referral_code}, {"$set":{"status":"successful"}})
            
    hashedStr = hashed_password.decode("utf-8")
    checker = await users.find_one({"email":email})
    if checker:
        return JSONResponse({"status":"email"}, status_code=409)
    else:
        print(referrer)
        await users.insert_one({
            "userId": user_id,
            "name": name,
            "email": email,
            "password": hashed_password,
            "createdAt": created_at,
            "referrer":referrer,
            "referral_code":referral_code
        })

    return JSONResponse({"status": "User registered successfully", "userId": user_id}, status_code=200)


@app.post("/login")
async def login(request: Request):
    body = await request.json()
    email = body.get("email")
    password = body.get("password")
    
    user = await users.find_one({"email": email})
    if not user:
        return JSONResponse({"status":"email"}, status_code=404)
    try:
        if not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
            return JSONResponse({"status":"password"}, status_code=401)
    except:
        if not bcrypt.checkpw(password.encode("utf-8"), user['password'].encode("utf-8")):
            return JSONResponse({"status":"password"}, status_code=401)
    token = jwt.encode({"id":user['userId']}, key=JWT_SECRET, algorithm="HS256")
    print(token)
    return JSONResponse({"token": token, "email":email}, status_code=200)

@app.post("/create-referral")
async def create_ref(request: Request):
    body = await request.json()
    token = body.get("token")
    user_id = jwt.decode(token, key=JWT_SECRET, algorithms="HS256")
    target = body.get("target")
    print(user_id)
    
    if not user_id:
        return JSONResponse({"error":"Provide user id."}, status_code=422)
    code = str(uuid4())[:60]
    created = datetime.utcnow()
    date = datetime.today()
    await referrals.insert_one({"code": code, "created":created, "user":user_id['id'], "date":date, "count":0, "target":target,"status":"pending"})
    return JSONResponse({"code":code})

@app.post("/fetch-referred")
async def fetchReferred(request:Request):
    # try:
    data = await request.json()
    token = data.get("token")
    user = jwt.decode(token, key=JWT_SECRET, algorithms='HS256')
    referred = await users.find({"referrer":user['id']}, {"_id":0}).to_list()
    return JSONResponse({"referred":jsonable_encoder(referred)}, status_code=200)
    # except:
    #     return JSONResponse({"status":"failed"}, status_code=500)

@app.post("/fetch-score")
async def fetchScore(request: Request):
    try:
        data = await request.json()
        token = data.get("token")
        user = jwt.decode(token, key=JWT_SECRET, algorithms="HS256")
        referred = await users.find({"referrer":user['id']}).to_list()
        return JSONResponse({"score":len(referred)}, status_code=200)
    except:
        return JSONResponse({"status":"failed"}, status_code=500)

@app.post("/reset-password")
async def reset_pass(request: Request):
    try:
        data = await request.json()
        user = data.get("email")
        password = data.get("password").encode("utf-8")
        checker = await users.find_one({"userId":user})
        hashed = bcrypt.hashpw(password, bcrypt.gensalt(12))
        strHashed = hashed.decode("utf-8")
        await users.update_one({"userId":user['id']}, {"$set":{"password":strHashed}})
        return JSONResponse({"status":"success"})
    except:
        return JSONResponse({"status":"failure"}, status_code=400)
    
@app.post("/verify-link")
async def verifyLink(request : Request):
    data = await request.json()
    code = data.get("code")

    checker = await referrals.find_one({"code":code})
    if not checker:
        return JSONResponse({"status":"invalid"}, status_code=401)
    if checker['status'] == "successful":
        return JSONResponse({"status":"expired"}, status_code=401)
    return JSONResponse({"status":"valid"}, status_code=200)


@app.post("/forgot-password")
async def forgot_password(request: Request):
    try:
        body = await request.json()
        email = body.get("email")

        user = await users.find_one({"email": email})
        if user:
            reset_token = jwt.encode({"id": user["userId"]}, key=JWT_SECRET)
            reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"
            currTime = datetime.utcnow()
            await resets.insert_one({"token":reset_token, "created":currTime})

            msg = MIMEMultipart()
            msg["Subject"] = "Password Reset Request"
            msg["From"] = EMAIL_USER
            msg["To"] = email
            msg.attach(MIMEText(f"""
                                <html>
                                <body>
                                <p>Click the link to reset your password: </p><a href=\"{reset_link}\">Click Here</a></p>
                                </body>
                                </html>
                                """, "html"))

            with smtplib.SMTP("smtp.gmail.com", 587, timeout=10.0) as server:
                server.starttls()
                server.login(EMAIL_USER, EMAIL_PASS)
                server.sendmail(EMAIL_USER, email, msg.as_string())
            return JSONResponse({"message": "Password reset link sent to email"}, status_code=200)
        else:
            return JSONResponse({"status":"email"}, status_code=400)
    except:
        return JSONResponse({"status":"format"}, status_code=400)

@app.post("/verify")
async def verify(request : Request):
    data = await request.json()
    token = data.get("token").encode("utf-8")
    try:
        decoded = jwt.decode(token, key=JWT_SECRET, algorithms="HS256")
        checker = await users.find_one({"email":decoded})
        if not checker:
            JSONResponse({"status":"failed"}, status_code=404)
        tokenChecker = await resets.find_one({"token": token})
        if not tokenChecker:
            JSONResponse({"status":"broken"}, status_code=404)
        await resets.delete_one({"token":token})
        return JSONResponse({"status":"success", "email":decoded}, status_code=200)
    except:
        return JSONResponse({"status":"failed"}, status_code=404)
    
