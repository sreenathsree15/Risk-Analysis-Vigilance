import json
import random
from datetime import datetime, timedelta

def generate_cases():
    total_cases = 1248
    
    # Distributions
    statuses = ["Pending"] * 642 + ["In Progress"] * 92 + ["Resolved"] * 514
    departments = ["LSGD"] * 472 + ["Health"] * 274 + ["PWD"] * 224 + ["Education"] * 149 + ["Others"] * 129
    severities = ["High"] * 215 + ["Medium"] * 487 + ["Low"] * 546
    
    # Shuffle distributions to randomize associations
    random.shuffle(statuses)
    random.shuffle(departments)
    random.shuffle(severities)
    
    districts_panchayats = {
        "Thiruvananthapuram": {"panchayats": ["Nemom", "Vellanad", "Kattakada", "Poonkulam", "Parassala", "Balaramapuram", "Neyyattinkara", "Venganoor"], "center": (8.5241, 76.9366)},
        "Kollam": {"panchayats": ["Karunagappally", "Kottarakkara", "Punalur", "Chathannoor"], "center": (8.8932, 76.6141)},
        "Pathanamthitta": {"panchayats": ["Adoor", "Thiruvalla", "Ranni", "Konni"], "center": (9.2648, 76.7870)},
        "Alappuzha": {"panchayats": ["Cherthala", "Kuttanad", "Chengannur", "Ambalappuzha"], "center": (9.4981, 76.3388)},
        "Kottayam": {"panchayats": ["Pala", "Changanassery", "Vaikom", "Kanjirappally"], "center": (9.5916, 76.5222)},
        "Ernakulam": {"panchayats": ["Aluva", "Kakkanad", "Fort Kochi", "Vyttila"], "center": (9.9816, 76.2999)},
        "Thrissur": {"panchayats": ["Chalakudy", "Guruvayur", "Kodungallur", "Kunnamkulam"], "center": (10.5276, 76.2144)},
        "Palakkad": {"panchayats": ["Chittur", "Ottapalam", "Shoranur", "Mannarkkad"], "center": (10.7867, 76.6548)},
        "Malappuram": {"panchayats": ["Manjeri", "Ponnani", "Tirur", "Perinthalmanna"], "center": (11.0733, 76.0740)},
        "Kozhikode": {"panchayats": ["Vadakara", "Koyilandy", "Feroke", "Beypore"], "center": (11.2588, 75.7804)},
        "Wayanad": {"panchayats": ["Kalpetta", "Mananthavady", "Sulthan Bathery", "Vythiri"], "center": (11.6854, 76.1320)},
        "Kannur": {"panchayats": ["Thalassery", "Taliparamba", "Payyanur", "Iritty"], "center": (11.8745, 75.3704)}
    }
    
    district_names = list(districts_panchayats.keys())
    
    start_date = datetime(2023, 6, 1)
    end_date = datetime(2024, 6, 30)
    time_delta = end_date - start_date
    
    cases = []
    
    for i in range(total_cases):
        case_id = f"VC/2024/{1001 + i}"
        
        district = random.choice(district_names)
        panchayat = random.choice(districts_panchayats[district]["panchayats"])
        
        # Generate random lat/lon near district center
        lat_offset = random.uniform(-0.15, 0.15)
        lon_offset = random.uniform(-0.15, 0.15)
        lat = districts_panchayats[district]["center"][0] + lat_offset
        lng = districts_panchayats[district]["center"][1] + lon_offset
        
        # Random date within the last year
        random_days = random.randint(0, time_delta.days)
        case_date = start_date + timedelta(days=random_days)
        date_str = case_date.strftime("%d %b %Y")
        
        cases.append({
            "caseId": case_id,
            "panchayat": panchayat,
            "district": district,
            "department": departments[i],
            "severity": severities[i],
            "status": statuses[i],
            "date": date_str,
            "latitude": round(lat, 6),
            "longitude": round(lng, 6)
        })
        
    # Write to db.json
    with open("db.json", "w") as f:
        json.dump({"cases": cases}, f, indent=2)
        
    print(f"Successfully generated db.json with {len(cases)} cases.")

if __name__ == "__main__":
    generate_cases()
