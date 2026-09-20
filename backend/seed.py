"""
Database Seed Script for QueueSense AI
Populates initial OPD departments, demo users, realistic patient queues, priority flags, and audit events.
"""

import json
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session

from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.department import Department
from app.models.patient import Patient
from app.models.token import QueueToken
from app.models.priority_flag import PriorityFlag
from app.models.queue_event import QueueEvent
from app.utils.security import get_password_hash
from app.utils.logging_config import setup_logging, logger


def seed_database():
    setup_logging()
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # 1. Seed Demo Users
        existing_users = db.query(User).count()
        if existing_users == 0:
            logger.info("Seeding demo users...")
            demo_users = [
                User(
                    name="Sister Bindu K.",
                    email="reception@queuesense.demo",
                    hashed_password=get_password_hash("Reception@123"),
                    role="reception",
                    department="Central Reception Desk",
                    is_active=True
                ),
                User(
                    name="Dr. Radhakrishnan K.",
                    email="doctor@queuesense.demo",
                    hashed_password=get_password_hash("Doctor@123"),
                    role="doctor",
                    department="General Medicine (Counter 1)",
                    is_active=True
                ),
                User(
                    name="Dr. Girish Mohan (RMO)",
                    email="admin@queuesense.demo",
                    hashed_password=get_password_hash("Admin@123"),
                    role="admin",
                    department="Medical Administration",
                    is_active=True
                ),
            ]
            db.add_all(demo_users)
            db.commit()
            logger.info("Demo users created successfully.")
        else:
            logger.info("Users already exist, skipping user seed.")

        # 2. Seed Departments
        existing_depts = db.query(Department).count()
        if existing_depts == 0:
            logger.info("Seeding OPD departments...")
            departments = [
                Department(
                    name="General Medicine",
                    code="GM",
                    malayalam_name="ജനറൽ മെഡിസിൻ",
                    location="Ground Floor, Block A",
                    active_counters=3,
                    total_counters=4,
                    average_service_duration=7.5,
                    color="#0d9488",
                    is_active=True
                ),
                Department(
                    name="Pediatrics",
                    code="PED",
                    malayalam_name="ശിശുരോഗ വിഭാഗം",
                    location="First Floor, Block B",
                    active_counters=2,
                    total_counters=3,
                    average_service_duration=9.0,
                    color="#0284c7",
                    is_active=True
                ),
                Department(
                    name="Orthopedics",
                    code="ORTHO",
                    malayalam_name="അസ്ഥിരോഗ വിഭാഗം",
                    location="Ground Floor, Block C",
                    active_counters=2,
                    total_counters=2,
                    average_service_duration=11.5,
                    color="#6366f1",
                    is_active=True
                ),
                Department(
                    name="ENT (Ear, Nose, Throat)",
                    code="ENT",
                    malayalam_name="ഇ എൻ ടി വിഭാഗം",
                    location="Second Floor, Block A",
                    active_counters=1,
                    total_counters=2,
                    average_service_duration=6.5,
                    color="#f59e0b",
                    is_active=True
                ),
            ]
            db.add_all(departments)
            db.commit()
            logger.info("Departments seeded successfully.")

        # 3. Seed Sample Patients & Tokens
        existing_tokens = db.query(QueueToken).count()
        if existing_tokens == 0:
            logger.info("Seeding realistic OPD queue tokens and patient records...")
            depts = {d.code: d for d in db.query(Department).all()}
            now = datetime.now(timezone.utc)

            gm_dept = depts.get("GM")
            ped_dept = depts.get("PED")
            ortho_dept = depts.get("ORTHO")
            ent_dept = depts.get("ENT")

            sample_data = [
                # GM Completed
                {
                    "dept": gm_dept,
                    "ref": "REF-8219 (Senior 68y)",
                    "name": "Patient K.R.",
                    "age": "Senior Citizen (60+)",
                    "type": "Walk-in OPD",
                    "acc": ["Wheelchair Assistance"],
                    "token": "GM-101",
                    "status": "COMPLETED",
                    "counter": 1,
                    "served": "Counter 1 (Dr. Radhakrishnan K.)",
                    "wait": 12,
                    "is_priority": False,
                    "duration": 8.0,
                    "reg_delta": 75,
                },
                # GM Completed
                {
                    "dept": gm_dept,
                    "ref": "REF-8224 (Adult 45y)",
                    "name": "Patient M.V.",
                    "age": "Adult (18-59)",
                    "type": "Scheduled Follow-up",
                    "acc": [],
                    "token": "GM-102",
                    "status": "COMPLETED",
                    "counter": 2,
                    "served": "Counter 2 (Dr. Sunitha Menon)",
                    "wait": 15,
                    "is_priority": False,
                    "duration": 7.0,
                    "reg_delta": 65,
                },
                # GM In Service
                {
                    "dept": gm_dept,
                    "ref": "REF-8230 (Adult 54y)",
                    "name": "Patient A.F.",
                    "age": "Adult (18-59)",
                    "type": "Walk-in OPD",
                    "acc": ["Malayalam Voice Prompt"],
                    "token": "GM-103",
                    "status": "IN_SERVICE",
                    "counter": 2,
                    "served": "Counter 2 (Dr. Sunitha Menon)",
                    "wait": 20,
                    "is_priority": False,
                    "reg_delta": 45,
                },
                # GM Called (Priority)
                {
                    "dept": gm_dept,
                    "ref": "REF-8238 (Super Senior 79y)",
                    "name": "Patient S.D.",
                    "age": "Super Senior (75+)",
                    "type": "Walk-in OPD",
                    "acc": ["Wheelchair Assistance", "Malayalam Voice Prompt"],
                    "token": "GM-104",
                    "status": "CALLED",
                    "counter": 1,
                    "served": "Counter 1 (Dr. Radhakrishnan K.)",
                    "wait": 10,
                    "is_priority": True,
                    "priority_reason": "Frail Super-Senior Mobility Assistance",
                    "priority_note": "Verified by Sister Bindu at 09:12 AM. Wheelchair provided.",
                    "reg_delta": 35,
                },
                # GM Waiting
                {
                    "dept": gm_dept,
                    "ref": "REF-8245 (Adult 38y)",
                    "name": "Patient R.C.",
                    "age": "Adult (18-59)",
                    "type": "Walk-in OPD",
                    "acc": [],
                    "token": "GM-105",
                    "status": "WAITING",
                    "wait": 18,
                    "is_priority": False,
                    "reg_delta": 25,
                },
                # GM Waiting (Priority)
                {
                    "dept": gm_dept,
                    "ref": "REF-8260 (Senior 71y)",
                    "name": "Patient B.T.",
                    "age": "Senior Citizen (60+)",
                    "type": "Referral Case",
                    "acc": ["Malayalam Voice Prompt"],
                    "token": "GM-106",
                    "status": "WAITING",
                    "wait": 15,
                    "is_priority": True,
                    "priority_reason": "Post-Chemotherapy Weakness Review",
                    "priority_note": "Authorized oncology cross-referral booklet presented.",
                    "reg_delta": 18,
                },
                # GM Waiting
                {
                    "dept": gm_dept,
                    "ref": "REF-8268 (Adult 52y)",
                    "name": "Patient N.P.",
                    "age": "Adult (18-59)",
                    "type": "Walk-in OPD",
                    "acc": [],
                    "token": "GM-107",
                    "status": "WAITING",
                    "wait": 25,
                    "is_priority": False,
                    "reg_delta": 10,
                },

                # Pediatrics Tokens
                {
                    "dept": ped_dept,
                    "ref": "REF-9102 (Child 4y)",
                    "name": "Child A.K.",
                    "age": "Pediatric (< 12)",
                    "type": "Walk-in OPD",
                    "acc": [],
                    "token": "PED-041",
                    "status": "COMPLETED",
                    "counter": 1,
                    "served": "Counter 1 (Dr. Priya Nair)",
                    "wait": 10,
                    "is_priority": False,
                    "duration": 9.5,
                    "reg_delta": 60,
                },
                {
                    "dept": ped_dept,
                    "ref": "REF-9114 (Infant 8m)",
                    "name": "Infant D.G.",
                    "age": "Infant (< 1)",
                    "type": "Vaccination & Check",
                    "acc": ["Malayalam Voice Prompt"],
                    "token": "PED-042",
                    "status": "IN_SERVICE",
                    "counter": 1,
                    "served": "Counter 1 (Dr. Priya Nair)",
                    "wait": 8,
                    "is_priority": True,
                    "priority_reason": "High Febrile Episode under 1 yr",
                    "priority_note": "Triage nurse verified temperature 102.4 F at vital station.",
                    "reg_delta": 30,
                },
                {
                    "dept": ped_dept,
                    "ref": "REF-9128 (Child 7y)",
                    "name": "Child R.R.",
                    "age": "Pediatric (< 12)",
                    "type": "Walk-in OPD",
                    "acc": [],
                    "token": "PED-043",
                    "status": "WAITING",
                    "wait": 18,
                    "is_priority": False,
                    "reg_delta": 15,
                },

                # Orthopedics Tokens
                {
                    "dept": ortho_dept,
                    "ref": "REF-7032 (Senior 62y)",
                    "name": "Patient V.S.",
                    "age": "Senior Citizen (60+)",
                    "type": "Plaster Removal",
                    "acc": ["Wheelchair Assistance"],
                    "token": "ORTHO-087",
                    "status": "IN_SERVICE",
                    "counter": 2,
                    "served": "Counter 2 (Dr. Deepa S.)",
                    "wait": 22,
                    "is_priority": False,
                    "reg_delta": 40,
                },
                {
                    "dept": ortho_dept,
                    "ref": "REF-7041 (Adult 56y)",
                    "name": "Patient M.A.",
                    "age": "Adult (18-59)",
                    "type": "Walk-in OPD",
                    "acc": [],
                    "token": "ORTHO-088",
                    "status": "CALLED",
                    "counter": 1,
                    "served": "Counter 1 (Dr. Mathew Joseph)",
                    "wait": 25,
                    "is_priority": False,
                    "reg_delta": 30,
                },
                {
                    "dept": ortho_dept,
                    "ref": "REF-7053 (Senior 73y)",
                    "name": "Patient T.K.",
                    "age": "Senior Citizen (60+)",
                    "type": "Acute Joint Pain",
                    "acc": ["Wheelchair Assistance", "Malayalam Voice Prompt"],
                    "token": "ORTHO-089",
                    "status": "WAITING",
                    "wait": 30,
                    "is_priority": True,
                    "priority_reason": "Severe Immobility / Acute Knee Sprain",
                    "priority_note": "Orderly assigned stretcher-to-wheelchair assistance.",
                    "reg_delta": 12,
                },

                # ENT Tokens
                {
                    "dept": ent_dept,
                    "ref": "REF-6012 (Adult 33y)",
                    "name": "Patient P.A.",
                    "age": "Adult (18-59)",
                    "type": "Walk-in OPD",
                    "acc": [],
                    "token": "ENT-029",
                    "status": "IN_SERVICE",
                    "counter": 1,
                    "served": "Counter 1 (Dr. Suresh Kumar)",
                    "wait": 14,
                    "is_priority": False,
                    "reg_delta": 30,
                },
                {
                    "dept": ent_dept,
                    "ref": "REF-6025 (Adult 49y)",
                    "name": "Patient K.S.",
                    "age": "Adult (18-59)",
                    "type": "Walk-in OPD",
                    "acc": ["Hearing/Speech Aid"],
                    "token": "ENT-030",
                    "status": "WAITING",
                    "wait": 12,
                    "is_priority": False,
                    "reg_delta": 10,
                },
            ]

            for item in sample_data:
                dept_obj = item["dept"]
                if not dept_obj:
                    continue

                reg_time = now - timedelta(minutes=item.get("reg_delta", 20))
                patient = Patient(
                    anonymous_reference=item["ref"],
                    anonymized_name=item["name"],
                    age_group=item["age"],
                    department_id=dept_obj.id,
                    visit_type=item["type"],
                    accessibility_needs=json.dumps(item["acc"]),
                    registration_time=reg_time
                )
                db.add(patient)
                db.flush()

                token = QueueToken(
                    token_number=item["token"],
                    patient_id=patient.id,
                    department_id=dept_obj.id,
                    status=item["status"],
                    counter_number=item.get("counter"),
                    counter_served=item.get("served"),
                    is_priority=item.get("is_priority", False),
                    priority_reason=item.get("priority_reason"),
                    registration_time=reg_time,
                    called_time=reg_time + timedelta(minutes=5) if item["status"] in ["CALLED", "IN_SERVICE", "COMPLETED"] else None,
                    service_start_time=reg_time + timedelta(minutes=7) if item["status"] in ["IN_SERVICE", "COMPLETED"] else None,
                    completion_time=reg_time + timedelta(minutes=15) if item["status"] == "COMPLETED" else None,
                    service_duration_minutes=item.get("duration"),
                    estimated_wait_minutes=item.get("wait", 15)
                )
                db.add(token)
                db.flush()

                # If priority, add priority flag
                if item.get("is_priority"):
                    audit = [
                        {
                            "action": "Priority Flag Created",
                            "user": "Sister Bindu (Staff Nurse - ID #412)",
                            "time": reg_time.strftime("%I:%M %p"),
                            "note": item.get("priority_note", "Triage intake verification")
                        }
                    ]
                    flag = PriorityFlag(
                        token_id=token.id,
                        patient_id=patient.id,
                        reason_category=item.get("priority_reason", "Staff Verified Priority"),
                        confidence=0.92,
                        status="ACCEPTED" if item["status"] in ["CALLED", "IN_SERVICE"] else "PENDING",
                        created_by="Sister Bindu (Staff Nurse - ID #412)",
                        reviewed_by="Dr. Radhakrishnan K. (Chief MO)" if item["status"] in ["CALLED", "IN_SERVICE"] else None,
                        review_notes=item.get("priority_note"),
                        audit_history=json.dumps(audit),
                        created_at=reg_time
                    )
                    db.add(flag)

                # Queue Event
                event = QueueEvent(
                    token_id=token.id,
                    event_type=item["status"],
                    performed_by="Staff",
                    timestamp=reg_time,
                    metadata_json=json.dumps({"token_number": item["token"]})
                )
                db.add(event)

            db.commit()
            logger.info("Sample OPD tokens, patients, priority flags, and audit events seeded successfully.")

    except Exception as e:
        db.rollback()
        logger.error(f"Seeding error: {e}", exc_info=True)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
    print("\n[SUCCESS] QueueSense AI database seeded successfully with demo users, departments, and tokens!")
    print("Demo Users:")
    print(" - Reception: reception@queuesense.demo / Reception@123")
    print(" - Doctor:    doctor@queuesense.demo / Doctor@123")
    print(" - Admin:     admin@queuesense.demo / Admin@123\n")

