--
-- PostgreSQL database dump
--

\restrict 5R8NgCduwOKX1vkJPrnj4bPIleaM9NbEao6WQJyCj5unTmXa4IJxUBhsMxauT1W

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-06-17 14:43:57

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 164172)
-- Name: admissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admissions (
    id uuid NOT NULL,
    patient_id uuid NOT NULL,
    doctor_id uuid,
    ward character varying,
    bed_number character varying,
    admission_date date NOT NULL,
    discharge_date date,
    diagnosis text,
    is_active boolean,
    created_at timestamp without time zone
);


ALTER TABLE public.admissions OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 164151)
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    id uuid NOT NULL,
    patient_id uuid NOT NULL,
    doctor_id uuid NOT NULL,
    appointment_date date NOT NULL,
    appointment_time character varying,
    appointment_type character varying,
    status character varying,
    notes text,
    created_at timestamp without time zone
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 164084)
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id uuid NOT NULL,
    hospital_id uuid,
    name character varying NOT NULL,
    description text,
    head_doctor character varying,
    total_beds integer,
    created_at timestamp without time zone
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 164098)
-- Name: doctors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    department_id uuid,
    specialization character varying,
    qualification character varying,
    experience_years integer,
    phone character varying,
    license_number character varying,
    is_available boolean,
    created_at timestamp without time zone
);


ALTER TABLE public.doctors OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 164075)
-- Name: hospitals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hospitals (
    id uuid NOT NULL,
    name character varying NOT NULL,
    address text,
    phone character varying,
    email character varying,
    established_year integer,
    created_at timestamp without time zone
);


ALTER TABLE public.hospitals OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 164253)
-- Name: icu_alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.icu_alerts (
    id uuid NOT NULL,
    icu_patient_id uuid NOT NULL,
    alert_type character varying NOT NULL,
    message text NOT NULL,
    severity character varying,
    is_acknowledged boolean,
    created_at timestamp without time zone
);


ALTER TABLE public.icu_alerts OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 164192)
-- Name: icu_patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.icu_patients (
    id uuid NOT NULL,
    patient_id uuid NOT NULL,
    doctor_id uuid,
    bed_number character varying NOT NULL,
    admission_date date NOT NULL,
    condition character varying,
    heart_rate double precision,
    blood_pressure character varying,
    oxygen_saturation double precision,
    temperature double precision,
    is_active boolean,
    created_at timestamp without time zone
);


ALTER TABLE public.icu_patients OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 164213)
-- Name: lab_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lab_reports (
    id uuid NOT NULL,
    patient_id uuid NOT NULL,
    doctor_id uuid,
    report_name character varying NOT NULL,
    report_type character varying,
    file_url character varying,
    status character varying,
    requested_date date,
    result_date date,
    priority character varying,
    notes text,
    created_at timestamp without time zone
);


ALTER TABLE public.lab_reports OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 164233)
-- Name: medical_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_records (
    id uuid NOT NULL,
    patient_id uuid NOT NULL,
    doctor_id uuid,
    record_type character varying,
    title character varying NOT NULL,
    description text,
    file_url character varying,
    record_date date,
    created_at timestamp without time zone
);


ALTER TABLE public.medical_records OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 164132)
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    assigned_doctor_id uuid,
    date_of_birth date,
    gender character varying,
    blood_group character varying,
    phone character varying,
    address text,
    emergency_contact character varying,
    patient_type character varying,
    current_condition character varying,
    status character varying,
    created_at timestamp without time zone
);


ALTER TABLE public.patients OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 164309)
-- Name: pharmacy_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pharmacy_orders (
    id uuid NOT NULL,
    prescription_id uuid NOT NULL,
    status character varying,
    notes text,
    created_at timestamp without time zone,
    ready_at timestamp without time zone,
    dispensed_at timestamp without time zone
);


ALTER TABLE public.pharmacy_orders OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 164294)
-- Name: prescription_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescription_items (
    id uuid NOT NULL,
    prescription_id uuid NOT NULL,
    medicine_name character varying NOT NULL,
    dosage character varying,
    frequency character varying,
    duration character varying,
    instructions text
);


ALTER TABLE public.prescription_items OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 164269)
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescriptions (
    id uuid NOT NULL,
    patient_id uuid NOT NULL,
    doctor_id uuid NOT NULL,
    appointment_id uuid,
    diagnosis text,
    notes text,
    image_url character varying,
    ai_summary text,
    created_at timestamp without time zone
);


ALTER TABLE public.prescriptions OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 164117)
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    id uuid NOT NULL,
    full_name character varying NOT NULL,
    role character varying NOT NULL,
    department_id uuid,
    phone character varying,
    email character varying,
    shift character varying,
    is_active boolean,
    created_at timestamp without time zone
);


ALTER TABLE public.staff OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 164064)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying NOT NULL,
    hashed_password character varying NOT NULL,
    full_name character varying,
    role character varying,
    is_active boolean,
    created_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 5118 (class 0 OID 164172)
-- Dependencies: 226
-- Data for Name: admissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admissions (id, patient_id, doctor_id, ward, bed_number, admission_date, discharge_date, diagnosis, is_active, created_at) FROM stdin;
ad000000-0000-0000-0000-000000000001	b0000000-0000-0000-0000-000000000007	dc000000-0000-0000-0000-000000000001	Cardiac Ward	C-101	2026-06-05	\N	Post-open heart surgery recovery - monitoring	t	\N
ad000000-0000-0000-0000-000000000002	b0000000-0000-0000-0000-000000000008	dc000000-0000-0000-0000-000000000001	Cardiac Ward	C-102	2026-06-08	\N	Severe angina - observation and medication	t	\N
07115dd3-557d-410e-a681-caec264bd8ee	93223d39-04e8-46a0-998d-354faf4bc5db	dc000000-0000-0000-0000-000000000002	General Ward B	B-102	2026-06-15	\N	Recovering from Appendectomy	t	2026-06-15 08:33:28.878819
5147d2e5-fba9-431d-b1da-8492dbca06ac	f930f972-385f-4209-bcbc-0f7a8c5cfbec	2e01fdc0-8309-42b1-afa3-126e6d832e08	General Ward B	B-102	2026-06-15	\N	High fever	t	2026-06-15 08:33:29.333017
06660917-8528-4be8-a43d-10efd692fd7b	d757d75e-181b-4bf1-96aa-e00c4ef7fe0c	c5f5df06-2a8c-4d19-9784-6e088248c7eb	General Ward B	B-102	2026-06-17	\N	Recovering from Appendectomy	t	2026-06-17 07:04:38.094324
\.


--
-- TOC entry 5117 (class 0 OID 164151)
-- Dependencies: 225
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (id, patient_id, doctor_id, appointment_date, appointment_time, appointment_type, status, notes, created_at) FROM stdin;
af000000-0000-0000-0000-000000000001	b0000000-0000-0000-0000-000000000001	dc000000-0000-0000-0000-000000000001	2026-06-10	09:00 AM	consultation	confirmed	\N	\N
af000000-0000-0000-0000-000000000002	b0000000-0000-0000-0000-000000000002	dc000000-0000-0000-0000-000000000001	2026-06-10	10:30 AM	follow-up	scheduled	\N	\N
af000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000003	dc000000-0000-0000-0000-000000000001	2026-06-10	02:00 PM	check-up	confirmed	\N	\N
af000000-0000-0000-0000-000000000004	b0000000-0000-0000-0000-000000000001	dc000000-0000-0000-0000-000000000001	2026-06-11	11:00 AM	follow-up	confirmed	\N	\N
af000000-0000-0000-0000-000000000005	b0000000-0000-0000-0000-000000000004	dc000000-0000-0000-0000-000000000001	2026-06-13	03:00 PM	consultation	scheduled	\N	\N
af000000-0000-0000-0000-000000000006	b0000000-0000-0000-0000-000000000005	dc000000-0000-0000-0000-000000000001	2026-06-15	10:00 AM	follow-up	confirmed	\N	\N
af000000-0000-0000-0000-000000000007	b0000000-0000-0000-0000-000000000002	dc000000-0000-0000-0000-000000000001	2026-06-03	09:00 AM	consultation	completed	\N	\N
af000000-0000-0000-0000-000000000008	b0000000-0000-0000-0000-000000000003	dc000000-0000-0000-0000-000000000001	2026-05-27	11:00 AM	check-up	completed	\N	\N
c56bb8ce-5f21-47a4-807c-1d0ab8428118	f930f972-385f-4209-bcbc-0f7a8c5cfbec	2e01fdc0-8309-42b1-afa3-126e6d832e08	2026-06-10	10:00 AM	consultation	completed	Routine health checkup and symptom review.	2026-06-11 07:28:43.18138
446b81e9-e954-4277-971c-2fbf8979e782	f930f972-385f-4209-bcbc-0f7a8c5cfbec	2e01fdc0-8309-42b1-afa3-126e6d832e08	2026-06-16	02:30 PM	follow_up	confirmed	Follow-up on prescribed medication progress.	2026-06-11 07:28:43.181392
eba78277-0c81-4b76-b8ff-ac3808cb1d5f	b0000000-0000-0000-0000-000000000008	2e01fdc0-8309-42b1-afa3-126e6d832e08	2026-06-12	12:00	follow-up	scheduled		2026-06-12 04:48:02.643415
5170c65b-ef41-426d-a45f-72fcf060b00f	b0000000-0000-0000-0000-000000000002	2e01fdc0-8309-42b1-afa3-126e6d832e08	2026-06-12	12:00	follow-up	scheduled		2026-06-12 04:58:38.353744
2405aba1-3b95-4934-a821-7d0304ebdd1f	a0000000-0000-0000-0000-000000000003	2e01fdc0-8309-42b1-afa3-126e6d832e08	2026-06-12	12:00	follow-up	scheduled		2026-06-12 05:04:04.971185
ea2c69c2-0832-481d-a216-77a59da0ebd0	b0000000-0000-0000-0000-000000000002	2e01fdc0-8309-42b1-afa3-126e6d832e08	2026-06-13	10:00	follow-up	scheduled		2026-06-12 05:59:29.014326
\.


--
-- TOC entry 5113 (class 0 OID 164084)
-- Dependencies: 221
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, hospital_id, name, description, head_doctor, total_beds, created_at) FROM stdin;
d1000000-0000-0000-0000-000000000001	a1000000-0000-0000-0000-000000000001	Cardiology	Heart and cardiovascular treatment	Dr. Priya Sharma	20	\N
d1000000-0000-0000-0000-000000000002	a1000000-0000-0000-0000-000000000001	General Medicine	Primary care and general health	Dr. Ravi Kumar	30	\N
d1000000-0000-0000-0000-000000000003	a1000000-0000-0000-0000-000000000001	Neurology	Brain and nervous system disorders	Dr. Anita Rao	15	\N
d1000000-0000-0000-0000-000000000004	a1000000-0000-0000-0000-000000000001	Orthopedics	Bone, joint and muscle care	Dr. Suresh Reddy	25	\N
d1000000-0000-0000-0000-000000000005	a1000000-0000-0000-0000-000000000001	Pediatrics	Child health and development	Dr. Meena Iyer	20	\N
d1000000-0000-0000-0000-000000000006	a1000000-0000-0000-0000-000000000001	Oncology	Cancer diagnosis and treatment	Dr. Priya Sharma	18	\N
78442b40-34f7-429a-99fe-6e5a1f53791e	\N	Dermatology	All types of skin	Dr. John	5	2026-06-17 06:45:23.287935
\.


--
-- TOC entry 5114 (class 0 OID 164098)
-- Dependencies: 222
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctors (id, user_id, department_id, specialization, qualification, experience_years, phone, license_number, is_available, created_at) FROM stdin;
dc000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	d1000000-0000-0000-0000-000000000001	Cardiologist	MBBS, MD (Cardiology)	12	+91-9876543210	MCI-CAR-2012-001	t	\N
dc000000-0000-0000-0000-000000000002	a0000000-0000-0000-0000-000000000005	d1000000-0000-0000-0000-000000000002	General Physician	MBBS, MD	8	+91-9876543211	MCI-GP-2016-002	t	\N
2e01fdc0-8309-42b1-afa3-126e6d832e08	d117f553-9e24-4d15-a70b-90b816998fdc	d1000000-0000-0000-0000-000000000003	Neurology	MBBS,PHD	7	8976541230	\N	t	2026-06-11 06:43:09.820966
c5f5df06-2a8c-4d19-9784-6e088248c7eb	cb44a533-5dd5-43fe-8581-06089f9809c2	78442b40-34f7-429a-99fe-6e5a1f53791e	Dermotology	M.D	8	9876123409	\N	t	2026-06-17 07:01:00.48332
\.


--
-- TOC entry 5112 (class 0 OID 164075)
-- Dependencies: 220
-- Data for Name: hospitals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hospitals (id, name, address, phone, email, established_year, created_at) FROM stdin;
a1000000-0000-0000-0000-000000000001	Cerevyn General Hospital	123, Health Avenue, Hyderabad, Telangana - 500001	+91-40-12345678	info@cerevynhospital.com	2005	\N
\.


--
-- TOC entry 5122 (class 0 OID 164253)
-- Dependencies: 230
-- Data for Name: icu_alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.icu_alerts (id, icu_patient_id, alert_type, message, severity, is_acknowledged, created_at) FROM stdin;
ca000000-0000-0000-0000-000000000001	c0000000-0000-0000-0000-000000000001	heart_rate	Heart rate spiked to 140 bpm — above critical threshold (120 bpm)	critical	f	\N
ca000000-0000-0000-0000-000000000002	c0000000-0000-0000-0000-000000000001	blood_pressure	Blood pressure elevated to 180/110 — hypertensive crisis detected	high	f	\N
ca000000-0000-0000-0000-000000000003	c0000000-0000-0000-0000-000000000002	oxygen	SpO2 dropped below 90% — hypoxia detected, immediate attention needed	critical	f	\N
ca000000-0000-0000-0000-000000000004	c0000000-0000-0000-0000-000000000002	temperature	Body temperature rose to 39.5°C — fever alert	medium	f	\N
bf9f886c-7560-416b-a725-20a9c29f3eef	01424c12-fd1a-462c-8bc8-de606b7a0150	oxygen	Oxygen saturation dropped below 94% (currently 93%)	high	f	2026-06-15 08:33:28.905013
b7472187-879d-429f-9b39-a7205643f8ac	e0778337-cd27-4eac-a977-e725de5968b0	oxygen	Oxygen saturation dropped below 94% (currently 93%)	high	f	2026-06-15 08:33:29.33936
49b80bb8-0bac-4897-86f0-01822c80b8ac	69bc5bd2-6d2b-4e10-b0ae-590aecef4b21	oxygen	Oxygen saturation dropped below 94% (currently 93%)	high	f	2026-06-17 07:04:38.101769
\.


--
-- TOC entry 5119 (class 0 OID 164192)
-- Dependencies: 227
-- Data for Name: icu_patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.icu_patients (id, patient_id, doctor_id, bed_number, admission_date, condition, heart_rate, blood_pressure, oxygen_saturation, temperature, is_active, created_at) FROM stdin;
c0000000-0000-0000-0000-000000000001	b0000000-0000-0000-0000-000000000009	dc000000-0000-0000-0000-000000000001	ICU-01	2026-06-09	Acute MI - Critical	112.5	160/100	91.2	38.5	t	\N
c0000000-0000-0000-0000-000000000002	b0000000-0000-0000-0000-000000000010	dc000000-0000-0000-0000-000000000001	ICU-02	2026-06-10	Respiratory Failure - Ventilator support	98	95/60	87.5	39.1	t	\N
01424c12-fd1a-462c-8bc8-de606b7a0150	6d318c2a-e49e-4050-a541-0de1090d046a	dc000000-0000-0000-0000-000000000002	ICU-A3	2026-06-15	Severe Pneumonia	94	130/80	93	38.5	t	2026-06-15 08:33:28.885305
e0778337-cd27-4eac-a977-e725de5968b0	a0000000-0000-0000-0000-000000000003	2e01fdc0-8309-42b1-afa3-126e6d832e08	ICU-A3	2026-06-15	Hypertension	94	130/80	93	38.5	t	2026-06-15 08:33:29.335169
69bc5bd2-6d2b-4e10-b0ae-590aecef4b21	af8937b6-91aa-45b4-b162-c323dc665974	c5f5df06-2a8c-4d19-9784-6e088248c7eb	ICU-A3	2026-06-17	Severe Pneumonia	94	130/80	93	38.5	t	2026-06-17 07:04:38.096746
\.


--
-- TOC entry 5120 (class 0 OID 164213)
-- Dependencies: 228
-- Data for Name: lab_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lab_reports (id, patient_id, doctor_id, report_name, report_type, file_url, status, requested_date, result_date, priority, notes, created_at) FROM stdin;
ab000000-0000-0000-0000-000000000001	b0000000-0000-0000-0000-000000000001	dc000000-0000-0000-0000-000000000001	Complete Blood Count	blood_test	\N	available	2026-05-31	2026-06-02	normal	\N	\N
ab000000-0000-0000-0000-000000000002	b0000000-0000-0000-0000-000000000001	dc000000-0000-0000-0000-000000000001	ECG Report	ecg	\N	available	2026-06-03	2026-06-05	high	\N	\N
ab000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000002	dc000000-0000-0000-0000-000000000001	HbA1c Test	blood_test	\N	available	2026-06-05	2026-06-07	high	\N	\N
ab000000-0000-0000-0000-000000000004	b0000000-0000-0000-0000-000000000003	dc000000-0000-0000-0000-000000000001	Cardiac Enzyme Panel	blood_test	\N	pending	2026-06-08	\N	high	\N	\N
ab000000-0000-0000-0000-000000000005	b0000000-0000-0000-0000-000000000004	dc000000-0000-0000-0000-000000000001	Spirometry	ecg	\N	pending	2026-06-09	\N	normal	\N	\N
ab000000-0000-0000-0000-000000000006	b0000000-0000-0000-0000-000000000005	dc000000-0000-0000-0000-000000000001	X-Ray (Left Knee)	xray	\N	available	2026-05-27	2026-05-29	normal	\N	\N
ab000000-0000-0000-0000-000000000007	b0000000-0000-0000-0000-000000000001	dc000000-0000-0000-0000-000000000001	Lipid Profile	blood_test	\N	available	2026-05-21	2026-05-23	normal	\N	\N
372f7980-9087-4352-acdf-ec99ac842cf7	f930f972-385f-4209-bcbc-0f7a8c5cfbec	2e01fdc0-8309-42b1-afa3-126e6d832e08	Complete Blood Count (CBC)	blood_test	/uploads/lab_reports/2bf29c89-b365-4a5f-a18a-de2dc1f65c35.pdf	available	2026-06-11	2026-06-11	normal	\N	2026-06-11 06:53:17.358269
\.


--
-- TOC entry 5121 (class 0 OID 164233)
-- Dependencies: 229
-- Data for Name: medical_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medical_records (id, patient_id, doctor_id, record_type, title, description, file_url, record_date, created_at) FROM stdin;
bc064cea-68e8-4e00-9113-75ea42aea8b7	f930f972-385f-4209-bcbc-0f7a8c5cfbec	2e01fdc0-8309-42b1-afa3-126e6d832e08	consultation	General Physical Examination	No anomalies detected. Continue current observation	\N	2026-06-11	2026-06-11 06:52:29.549283
\.


--
-- TOC entry 5116 (class 0 OID 164132)
-- Dependencies: 224
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (id, user_id, assigned_doctor_id, date_of_birth, gender, blood_group, phone, address, emergency_contact, patient_type, current_condition, status, created_at) FROM stdin;
b0000000-0000-0000-0000-000000000003	b1000000-0000-0000-0000-000000000003	dc000000-0000-0000-0000-000000000001	1991-07-12	female	B+	+91-9000000003	\N	\N	outpatient	Diabetes Type 2	under_review	\N
b0000000-0000-0000-0000-000000000004	b1000000-0000-0000-0000-000000000004	dc000000-0000-0000-0000-000000000001	1966-11-08	male	AB+	+91-9000000004	\N	\N	outpatient	Cardiac Arrhythmia	critical	\N
b0000000-0000-0000-0000-000000000005	b1000000-0000-0000-0000-000000000005	dc000000-0000-0000-0000-000000000001	1997-04-25	female	O-	+91-9000000005	\N	\N	outpatient	Asthma	stable	\N
b0000000-0000-0000-0000-000000000006	b1000000-0000-0000-0000-000000000006	dc000000-0000-0000-0000-000000000001	1963-09-03	male	B-	+91-9000000006	\N	\N	outpatient	Osteoarthritis	improving	\N
b0000000-0000-0000-0000-000000000007	b1000000-0000-0000-0000-000000000007	dc000000-0000-0000-0000-000000000001	1975-02-14	female	A-	+91-9000000007	\N	\N	inpatient	Post-cardiac surgery recovery	under_review	\N
b0000000-0000-0000-0000-000000000008	b1000000-0000-0000-0000-000000000008	dc000000-0000-0000-0000-000000000001	1958-06-30	male	O+	+91-9000000008	\N	\N	inpatient	Severe chest pain observation	stable	\N
b0000000-0000-0000-0000-000000000009	b1000000-0000-0000-0000-000000000009	dc000000-0000-0000-0000-000000000001	1945-12-01	female	AB-	+91-9000000009	\N	\N	icu	Acute myocardial infarction	critical	\N
b0000000-0000-0000-0000-000000000010	b1000000-0000-0000-0000-000000000010	dc000000-0000-0000-0000-000000000001	1952-08-19	male	A+	+91-9000000010	\N	\N	icu	Respiratory failure	critical	\N
b0000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000003	dc000000-0000-0000-0000-000000000001	1985-06-15	male	O+	+91-9123456789	45, MG Road, Hyderabad	\N	outpatient	Hypertension	stable	\N
b0000000-0000-0000-0000-000000000002	b1000000-0000-0000-0000-000000000002	2e01fdc0-8309-42b1-afa3-126e6d832e08	1979-03-20	male	A+	+91-9000000002	\N	\N	outpatient	Hypertension	stable	\N
93223d39-04e8-46a0-998d-354faf4bc5db	51133d15-d6ef-499e-831b-142db03b5f22	dc000000-0000-0000-0000-000000000002	1990-05-12	male	O+	9876543210	\N	\N	inpatient	Recovering from Appendectomy	improving	2026-06-15 08:33:28.467973
6d318c2a-e49e-4050-a541-0de1090d046a	6ee94226-da71-4eda-8882-d7b84f696bdb	dc000000-0000-0000-0000-000000000002	1985-08-24	female	AB-	9876543211	\N	\N	icu	Severe Pneumonia	under_review	2026-06-15 08:33:28.86746
a0000000-0000-0000-0000-000000000003	a0000000-0000-0000-0000-000000000003	2e01fdc0-8309-42b1-afa3-126e6d832e08	1985-06-15	male	O+	+91-9123456789	45, MG Road, Hyderabad	\N	icu	Hypertension	improving	\N
f930f972-385f-4209-bcbc-0f7a8c5cfbec	87a4ad38-f22d-4dac-92e3-56e6a9411189	2e01fdc0-8309-42b1-afa3-126e6d832e08	1995-10-12	male	AB+	+916305770539	\N	\N	inpatient	High fever	under_review	2026-06-11 06:47:30.857157
d757d75e-181b-4bf1-96aa-e00c4ef7fe0c	8c0502ca-8250-4052-a3f6-0915bce0253e	c5f5df06-2a8c-4d19-9784-6e088248c7eb	1990-05-12	male	O+	9876543210	\N	\N	inpatient	Recovering from Appendectomy	improving	2026-06-17 07:04:37.743591
af8937b6-91aa-45b4-b162-c323dc665974	f0bb06f8-0474-4e8f-916e-43d1b9eb78b3	c5f5df06-2a8c-4d19-9784-6e088248c7eb	1985-08-24	female	AB-	9876543211	\N	\N	icu	Severe Pneumonia	under_review	2026-06-17 07:04:38.09128
\.


--
-- TOC entry 5125 (class 0 OID 164309)
-- Dependencies: 233
-- Data for Name: pharmacy_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pharmacy_orders (id, prescription_id, status, notes, created_at, ready_at, dispensed_at) FROM stdin;
be000000-0000-0000-0000-000000000001	bc000000-0000-0000-0000-000000000001	pending	\N	\N	\N	\N
be000000-0000-0000-0000-000000000002	bc000000-0000-0000-0000-000000000002	ready	\N	\N	\N	\N
605c0838-4598-43f5-8865-853ca91f9c94	8c74859f-a8cb-49c9-9063-938ff6c784f1	ready	\N	2026-06-11 06:51:52.848205	2026-06-11 09:32:03.492325	\N
87125701-b11d-46ea-bd4c-601125874c82	42352101-bfd3-41a5-929f-0ef882946122	pending	\N	2026-06-15 10:18:47.355432	\N	\N
\.


--
-- TOC entry 5124 (class 0 OID 164294)
-- Dependencies: 232
-- Data for Name: prescription_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescription_items (id, prescription_id, medicine_name, dosage, frequency, duration, instructions) FROM stdin;
bd000000-0000-0000-0000-000000000001	bc000000-0000-0000-0000-000000000001	Amlodipine	5mg	Once daily	30 days	Take in the morning
bd000000-0000-0000-0000-000000000002	bc000000-0000-0000-0000-000000000001	Telmisartan	40mg	Once daily	30 days	Take after breakfast
bd000000-0000-0000-0000-000000000003	bc000000-0000-0000-0000-000000000001	Aspirin	75mg	Once daily	30 days	Take after dinner
bd000000-0000-0000-0000-000000000004	bc000000-0000-0000-0000-000000000002	Metformin	500mg	Twice daily	60 days	Take with meals
bd000000-0000-0000-0000-000000000005	bc000000-0000-0000-0000-000000000002	Glimepiride	1mg	Once daily	60 days	Take before breakfast
39e737d2-ab04-420c-9cb3-e65d2974f32a	8c74859f-a8cb-49c9-9063-938ff6c784f1	Oseltamivir	75mg	Twice daily	5days	after dinner
c18a6bc2-20ce-416b-a205-6a24eefba046	42352101-bfd3-41a5-929f-0ef882946122	amaoxylin	500	twice	10	after breakfast
\.


--
-- TOC entry 5123 (class 0 OID 164269)
-- Dependencies: 231
-- Data for Name: prescriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescriptions (id, patient_id, doctor_id, appointment_id, diagnosis, notes, image_url, ai_summary, created_at) FROM stdin;
bc000000-0000-0000-0000-000000000001	b0000000-0000-0000-0000-000000000001	dc000000-0000-0000-0000-000000000001	af000000-0000-0000-0000-000000000007	Essential Hypertension	Monitor BP daily. Low salt diet. Avoid stress.	\N	\N	\N
bc000000-0000-0000-0000-000000000002	b0000000-0000-0000-0000-000000000003	dc000000-0000-0000-0000-000000000001	af000000-0000-0000-0000-000000000008	Type 2 Diabetes Mellitus	Diet control. Exercise. Retest HbA1c in 3 months.	\N	\N	\N
8c74859f-a8cb-49c9-9063-938ff6c784f1	f930f972-385f-4209-bcbc-0f7a8c5cfbec	2e01fdc0-8309-42b1-afa3-126e6d832e08	\N	Acute Influenza	Rest and hydration.	/uploads/prescriptions/c272004c-fcff-484b-8d93-ee2875708352.png	The prescription is for Oseltamivir, which is a medication commonly used to treat influenza. Here are the details:\n\nMedication: Oseltamivir 75 mg\nDosage: Take twice daily for 5 days, after dinner.\n\nThe clinical notes indicate that the diagnosis is acute influenza. The doctor recommends the following:\n\n1. Rest: Make sure to get plenty of sleep and take it easy to help your body recover.\n2. Hydration: Drink plenty of fluids, such as water, herbal teas, or broth, to stay hydrated.\n3. Stay warm: Keep yourself warm to help your body fight off the illness.\n\nTo manage your care, follow the prescribed dosage of Oseltamivir, ensuring you take it after dinner as directed. Monitor your symptoms and contact your healthcare provider if you experience any worsening or new symptoms.	2026-06-11 06:51:52.798747
42352101-bfd3-41a5-929f-0ef882946122	b0000000-0000-0000-0000-000000000002	2e01fdc0-8309-42b1-afa3-126e6d832e08	\N	hypertension		/uploads/prescriptions/d619d780-cc3a-4961-8d66-53a13e432a49.png	The prescription is for Sarah J. Miller and indicates a diagnosis of acute sinusitis and headache. Here are the details of the prescribed medications:\n\n1. Amoxicillin 875 mg / Clavulanate 125 mg: Take one tablet twice a day for 10 days.\n2. Fluticasone Propionate Nasal Spray 50 mcg: Use one spray in each nostril daily. This is for nasal congestion and is provided in one bottle.\n3. Ibuprofen 400 mg: Take one tablet every six hours as needed for pain or fever.\n\nFor managing your care, here are some simple instructions:\n\n- Take the amoxicillin and clavulanate as directed to help fight the infection. Make sure to complete the entire course even if you start to feel better before finishing.\n- Use the nasal spray daily as directed to relieve nasal congestion. Make sure to follow the instructions on how to use the spray correctly.\n- Use ibuprofen as needed for pain or fever, but do not exceed the recommended dosage. If you find you need it frequently, consult your healthcare provider.\n- Follow up with your healthcare provider in two weeks to assess your progress. If you have any concerns or if your symptoms worsen, contact them immediately. \n\nMake sure to start the medications as soon as possible for the best results.	2026-06-15 10:18:47.23675
\.


--
-- TOC entry 5115 (class 0 OID 164117)
-- Dependencies: 223
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff (id, full_name, role, department_id, phone, email, shift, is_active, created_at) FROM stdin;
e0000000-0000-0000-0000-000000000001	Ramya Krishnan	nurse	d1000000-0000-0000-0000-000000000001	+91-9001000001	ramya.k@hospital.com	morning	t	\N
e0000000-0000-0000-0000-000000000002	Vijay Nair	nurse	d1000000-0000-0000-0000-000000000001	+91-9001000002	vijay.n@hospital.com	evening	t	\N
e0000000-0000-0000-0000-000000000003	Deepa Menon	receptionist	d1000000-0000-0000-0000-000000000002	+91-9001000003	deepa.m@hospital.com	morning	t	\N
e0000000-0000-0000-0000-000000000004	Arjun Patel	lab_tech	d1000000-0000-0000-0000-000000000003	+91-9001000004	arjun.p@hospital.com	morning	t	\N
e0000000-0000-0000-0000-000000000006	Karthik Reddy	nurse	d1000000-0000-0000-0000-000000000001	+91-9001000006	karthik.r@hospital.com	night	t	\N
87fb7420-981f-4f60-b2ce-e5ffa9d2b967	Pharmacy	pharmacist	\N	+91-9000000099	pharmacy@hospital.com	morning	t	2026-06-15 12:47:54.440175
\.


--
-- TOC entry 5111 (class 0 OID 164064)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, hashed_password, full_name, role, is_active, created_at) FROM stdin;
a0000000-0000-0000-0000-000000000005	doctor2@hospital.com	$2b$12$OqcANjHG27kP05b0tvQCuu5VeiTAS.P86gAaf5JHOy1tJHuFukfOu	Dr. Ravi Kumar	doctor	t	\N
b1000000-0000-0000-0000-000000000002	john.smith@patient.com	$2b$12$dummyhashplaceholder1234567890AB	John Smith	patient	t	\N
b1000000-0000-0000-0000-000000000003	sarah.johnson@patient.com	$2b$12$dummyhashplaceholder1234567890AB	Sarah Johnson	patient	t	\N
b1000000-0000-0000-0000-000000000004	michael.brown@patient.com	$2b$12$dummyhashplaceholder1234567890AB	Michael Brown	patient	t	\N
b1000000-0000-0000-0000-000000000005	emily.davis@patient.com	$2b$12$dummyhashplaceholder1234567890AB	Emily Davis	patient	t	\N
b1000000-0000-0000-0000-000000000006	robert.wilson@patient.com	$2b$12$dummyhashplaceholder1234567890AB	Robert Wilson	patient	t	\N
b1000000-0000-0000-0000-000000000007	lisa.anderson@patient.com	$2b$12$dummyhashplaceholder1234567890AB	Lisa Anderson	patient	t	\N
b1000000-0000-0000-0000-000000000008	james.martin@patient.com	$2b$12$dummyhashplaceholder1234567890AB	James Martin	patient	t	\N
b1000000-0000-0000-0000-000000000009	patricia.garcia@patient.com	$2b$12$dummyhashplaceholder1234567890AB	Patricia Garcia	patient	t	\N
b1000000-0000-0000-0000-000000000010	david.lee@patient.com	$2b$12$dummyhashplaceholder1234567890AB	David Lee	patient	t	\N
a0000000-0000-0000-0000-000000000003	patient@hospital.com	$2b$12$UdDvPu0v3IbzlFkwf8NdCuLc3zd4tclzvmh.4wMOw1d3uQVi42uku	Krishna Kumar	patient	t	\N
87a4ad38-f22d-4dac-92e3-56e6a9411189	patient_test@hospital.com	$2b$12$53LSxV4RZILUEoaompkB5OidpDSOvJ1punfHgtR0Ud56/WgaZHEUO	Ada Lovelace	patient	t	2026-06-11 06:47:30.81716
51133d15-d6ef-499e-831b-142db03b5f22	inpatient_48d7fd@hospital.com	$2b$12$E7EHM5zGrugbiQUnmxpxD.OHgRFWtcHsT.XnpDIGSDvJOBEcQWZoq	John Doe (Inpatient)	patient	t	2026-06-15 08:33:28.448389
6ee94226-da71-4eda-8882-d7b84f696bdb	icu_46cd0c@hospital.com	$2b$12$DFDbjoIUjYmyUK/PtkJJk.eQvL58bQOVYu2H35JQpKErpC5cYPaWy	Sarah Smith (ICU)	patient	t	2026-06-15 08:33:28.864019
a0000000-0000-0000-0000-000000000001	admin@hospital.com	$2b$12$ckVPsigF6n.f84id3/aGe.Mbk4zgURieX2TF972.1jvGbE/hD96Bu	Hospital Administrator	hospital_admin	t	\N
a0000000-0000-0000-0000-000000000002	doctor@hospital.com	$2b$12$P4npBPef2CZDJKLW8eXSTeQoVH2J65GzxugcfRSD2.2TMlMWQlf0.	Dr. Priya Sharma	doctor	t	\N
d117f553-9e24-4d15-a70b-90b816998fdc	doctor_test@hospital.com	$2b$12$q0QMBmmc1q/Bxok.lJ5vL.3/tkZn4iTxWrennEOzxOfSfB8k0nbR2	Dr. Alan Turing	doctor	t	2026-06-11 06:43:09.762052
7313b7b4-4a15-41bf-9a2b-1c19b6e777eb	pharmacy@hospital.com	$2b$12$5joZXO.lWBQI/m.WOaev6OsgR2rslEDPva4O6ZZMYgZqQq4nDklQW	Pharmacy	pharmacist	t	2026-06-15 12:47:54.426684
cb44a533-5dd5-43fe-8581-06089f9809c2	john@hospital.com	$2b$12$OzRAzdu8uANJCij0UBt2h.e.IJXk.SaQ08LdolgMy6tHImxOEJ0ty	Dr. John	doctor	t	2026-06-17 07:01:00.427773
8c0502ca-8250-4052-a3f6-0915bce0253e	inpatient_1678a3@hospital.com	$2b$12$EyaAivmWXIV1Fa2INDU..OnMDf5HF1el0BGjI141AUksjNpcYO4UC	John Doe (Inpatient)	patient	t	2026-06-17 07:04:37.735558
f0bb06f8-0474-4e8f-916e-43d1b9eb78b3	icu_a7b1a5@hospital.com	$2b$12$zpS3KZFWhHhKfnfPjHKWFuIgDemNlJ43hNjZcxpYW49Nk050IeZki	Sarah Smith (ICU)	patient	t	2026-06-17 07:04:38.09052
\.


--
-- TOC entry 4927 (class 2606 OID 164181)
-- Name: admissions admissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admissions
    ADD CONSTRAINT admissions_pkey PRIMARY KEY (id);


--
-- TOC entry 4925 (class 2606 OID 164161)
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- TOC entry 4917 (class 2606 OID 164092)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- TOC entry 4919 (class 2606 OID 164106)
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- TOC entry 4915 (class 2606 OID 164083)
-- Name: hospitals hospitals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospitals
    ADD CONSTRAINT hospitals_pkey PRIMARY KEY (id);


--
-- TOC entry 4935 (class 2606 OID 164263)
-- Name: icu_alerts icu_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.icu_alerts
    ADD CONSTRAINT icu_alerts_pkey PRIMARY KEY (id);


--
-- TOC entry 4929 (class 2606 OID 164202)
-- Name: icu_patients icu_patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.icu_patients
    ADD CONSTRAINT icu_patients_pkey PRIMARY KEY (id);


--
-- TOC entry 4931 (class 2606 OID 164222)
-- Name: lab_reports lab_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_reports
    ADD CONSTRAINT lab_reports_pkey PRIMARY KEY (id);


--
-- TOC entry 4933 (class 2606 OID 164242)
-- Name: medical_records medical_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_pkey PRIMARY KEY (id);


--
-- TOC entry 4923 (class 2606 OID 164140)
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- TOC entry 4941 (class 2606 OID 164317)
-- Name: pharmacy_orders pharmacy_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_orders
    ADD CONSTRAINT pharmacy_orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4939 (class 2606 OID 164303)
-- Name: prescription_items prescription_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4937 (class 2606 OID 164278)
-- Name: prescriptions prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_pkey PRIMARY KEY (id);


--
-- TOC entry 4921 (class 2606 OID 164126)
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- TOC entry 4913 (class 2606 OID 164073)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4911 (class 1259 OID 164074)
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- TOC entry 4950 (class 2606 OID 164187)
-- Name: admissions admissions_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admissions
    ADD CONSTRAINT admissions_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- TOC entry 4951 (class 2606 OID 164182)
-- Name: admissions admissions_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admissions
    ADD CONSTRAINT admissions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- TOC entry 4948 (class 2606 OID 164167)
-- Name: appointments appointments_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- TOC entry 4949 (class 2606 OID 164162)
-- Name: appointments appointments_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- TOC entry 4942 (class 2606 OID 164093)
-- Name: departments departments_hospital_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id);


--
-- TOC entry 4943 (class 2606 OID 164112)
-- Name: doctors doctors_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- TOC entry 4944 (class 2606 OID 164107)
-- Name: doctors doctors_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4958 (class 2606 OID 164264)
-- Name: icu_alerts icu_alerts_icu_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.icu_alerts
    ADD CONSTRAINT icu_alerts_icu_patient_id_fkey FOREIGN KEY (icu_patient_id) REFERENCES public.icu_patients(id);


--
-- TOC entry 4952 (class 2606 OID 164208)
-- Name: icu_patients icu_patients_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.icu_patients
    ADD CONSTRAINT icu_patients_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- TOC entry 4953 (class 2606 OID 164203)
-- Name: icu_patients icu_patients_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.icu_patients
    ADD CONSTRAINT icu_patients_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- TOC entry 4954 (class 2606 OID 164228)
-- Name: lab_reports lab_reports_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_reports
    ADD CONSTRAINT lab_reports_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- TOC entry 4955 (class 2606 OID 164223)
-- Name: lab_reports lab_reports_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_reports
    ADD CONSTRAINT lab_reports_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- TOC entry 4956 (class 2606 OID 164248)
-- Name: medical_records medical_records_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- TOC entry 4957 (class 2606 OID 164243)
-- Name: medical_records medical_records_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- TOC entry 4946 (class 2606 OID 164146)
-- Name: patients patients_assigned_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_assigned_doctor_id_fkey FOREIGN KEY (assigned_doctor_id) REFERENCES public.doctors(id);


--
-- TOC entry 4947 (class 2606 OID 164141)
-- Name: patients patients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4963 (class 2606 OID 164318)
-- Name: pharmacy_orders pharmacy_orders_prescription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_orders
    ADD CONSTRAINT pharmacy_orders_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id);


--
-- TOC entry 4962 (class 2606 OID 164304)
-- Name: prescription_items prescription_items_prescription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id);


--
-- TOC entry 4959 (class 2606 OID 164289)
-- Name: prescriptions prescriptions_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- TOC entry 4960 (class 2606 OID 164284)
-- Name: prescriptions prescriptions_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- TOC entry 4961 (class 2606 OID 164279)
-- Name: prescriptions prescriptions_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- TOC entry 4945 (class 2606 OID 164127)
-- Name: staff staff_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


-- Completed on 2026-06-17 14:43:58

--
-- PostgreSQL database dump complete
--

\unrestrict 5R8NgCduwOKX1vkJPrnj4bPIleaM9NbEao6WQJyCj5unTmXa4IJxUBhsMxauT1W

