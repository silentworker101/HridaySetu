# HridaySetu - Technical Design Document

## Executive Summary

This document provides the technical design for HridaySetu, a privacy-first AI-powered healthcare platform for India. The design follows a microservices architecture with FHIR as the central data standard, implementing multi-channel patient access, AI-driven clinical automation, and privacy-preserving research capabilities.

## Design Principles

1. **Privacy by Design:** End-to-end encryption, explicit consent, and data minimization
2. **Standards-First:** FHIR R4 as the foundation for interoperability
3. **AI Transparency:** Explainable AI with human-in-the-loop validation
4. **Scalability:** Cloud-native, horizontally scalable architecture
5. **Accessibility:** Multi-language, multi-channel support for diverse users
6. **Resilience:** Fault-tolerant design with comprehensive monitoring

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Mobile App│  │  Web UI  │  │ WhatsApp │  │   IVR    │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   API Gateway     │
                    │  (Authentication) │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────┐
│                    Service Layer                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │Ingestion │  │Clinical  │  │Patient   │  │Research  │      │
│  │Service   │  │Service   │  │Service   │  │Service   │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │AI/ML     │  │Workflow  │  │Notification│ │Analytics │      │
│  │Service   │  │Service   │  │Service   │  │Service   │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────┼─────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   FHIR Server     │
                    │  (HAPI FHIR)      │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────┐
│                      Data Layer                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │PostgreSQL│  │MongoDB   │  │Redis     │  │S3/Blob   │      │
│  │(FHIR)    │  │(Logs)    │  │(Cache)   │  │(Files)   │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Mobile: React Native (iOS/Android)
- Web: React.js with TypeScript
- State Management: Redux Toolkit
- UI Framework: Material-UI / Chakra UI

**Backend:**
- Runtime: Node.js (TypeScript) / Python (AI services)
- API Framework: Express.js / FastAPI
- FHIR Server: HAPI FHIR (Java)
- Message Queue: RabbitMQ / Apache Kafka
- API Gateway: Kong / AWS API Gateway

**AI/ML:**
- Generative AI: AWS Bedrock (Claude, Llama, Titan)
- Framework: PyTorch / TensorFlow (for custom models)
- NLP: Hugging Face Transformers, spaCy
- OCR: AWS Textract
- Speech: AWS Transcribe
- Translation: AWS Translate

**Data:**
- FHIR Store: PostgreSQL with HAPI FHIR
- Document Store: MongoDB
- Cache: Redis
- Object Storage: AWS S3 / Azure Blob
- Search: Elasticsearch

**Infrastructure:**
- Cloud: AWS / Azure / GCP (multi-cloud ready)
- Containers: Docker
- Orchestration: Kubernetes
- CI/CD: GitHub Actions / GitLab CI
- Monitoring: Prometheus, Grafana, ELK Stack
- Security: HashiCorp Vault, AWS KMS

## Core Components Design

### 1. Data Ingestion Service

**Purpose:** Multi-source data ingestion and normalization to FHIR format

**Components:**

#### 1.1 Ingestion Pipeline

```typescript
interface IngestionPipeline {
  // Input handlers
  handleHL7Message(message: HL7Message): Promise<FHIRResource>;
  handleFHIRBundle(bundle: FHIRBundle): Promise<void>;
  handleCSV(file: File, mapping: CSVMapping): Promise<FHIRResource[]>;
  handlePDF(file: File): Promise<FHIRResource[]>;
  handleImage(file: File): Promise<FHIRResource[]>;
  handleVoiceNote(audio: AudioFile): Promise<FHIRResource[]>;
  
  // Processing
  validateInput(data: any): ValidationResult;
  normalizeToFHIR(data: any, sourceType: SourceType): FHIRResource;
  enrichData(resource: FHIRResource): FHIRResource;
  
  // Output
  persistToFHIRServer(resource: FHIRResource): Promise<string>;
  publishEvent(event: IngestionEvent): Promise<void>;
}
```

**Data Flow:**
1. Receive data from source (API, file upload, HL7 feed)
2. Validate format and structure
3. Extract relevant information using appropriate parser
4. Map to FHIR resources (Patient, Observation, Condition, etc.)
5. Enrich with metadata (timestamps, source, confidence scores)
6. Validate FHIR compliance
7. Persist to FHIR server
8. Publish ingestion event for downstream processing
9. Log audit trail

**FHIR Resource Mapping:**

| Source Data | FHIR Resource | Key Fields |
|-------------|---------------|------------|
| Patient Demographics | Patient | name, identifier, birthDate, gender, address, telecom |
| Lab Results | Observation | code (LOINC), value, effectiveDateTime, performer |
| Diagnoses | Condition | code (ICD-10/SNOMED), onsetDateTime, clinicalStatus |
| Medications | MedicationRequest | medication, dosageInstruction, authoredOn |
| Procedures | Procedure | code (SNOMED), performedDateTime, performer |
| Encounters | Encounter | type, period, participant, serviceProvider |
| Billing | Claim | item, total, created, provider |
| Documents | DocumentReference | content, type, date, author |

#### 1.2 PDF/Image Processing

**OCR Pipeline:**
```python
class DocumentProcessor:
    def process_medical_document(self, file: bytes) -> FHIRResources:
        # Preprocessing
        image = self.preprocess_image(file)
        
        # OCR extraction
        text = self.extract_text(image)
        tables = self.extract_tables(image)
        
        # NER for medical entities
        entities = self.extract_medical_entities(text)
        
        # Structure recognition
        document_type = self.classify_document(text, entities)
        
        # FHIR mapping
        resources = self.map_to_fhir(entities, document_type)
        
        return resources
```

**Supported Document Types:**
- Lab reports → Observation resources
- Prescription → MedicationRequest resources
- Discharge summary → Composition + multiple resources
- Radiology reports → DiagnosticReport + Observation
- Billing invoices → Claim resources

### 2. FHIR Server & Data Model

**FHIR Server:** HAPI FHIR (open-source, production-ready)

**Core FHIR Resources:**

```
Patient (Demographics, identifiers)
├── Encounter (Visits, admissions)
│   ├── Observation (Vitals, labs)
│   ├── Condition (Diagnoses)
│   ├── Procedure (Treatments)
│   ├── MedicationRequest (Prescriptions)
│   └── DocumentReference (Reports, images)
├── AllergyIntolerance (Allergies)
├── Immunization (Vaccines)
├── CarePlan (Treatment plans)
└── Claim (Billing)
```

**Custom Extensions:**
- Indian-specific identifiers (Aadhaar, ABHA)
- Regional language support
- Ayurvedic/traditional medicine codes
- Indian dietary preferences
- Socioeconomic indicators

**FHIR Search Parameters:**
```
GET /Patient?identifier=ABHA|12345678
GET /Observation?patient=123&code=http://loinc.org|2339-0
GET /Condition?patient=123&clinical-status=active
GET /MedicationRequest?patient=123&status=active
GET /Encounter?patient=123&date=ge2025-01-01
```

### 3. Clinical Service

**Purpose:** Clinical summary generation, note automation, and decision support

#### 3.1 Clinical Summary Generator

```typescript
interface ClinicalSummaryService {
  generateSummary(patientId: string, options: SummaryOptions): Promise<ClinicalSummary>;
  generateTimeline(patientId: string): Promise<Timeline>;
  identifyKeyFindings(patientId: string): Promise<KeyFinding[]>;
  analyzeTrends(patientId: string, metric: string): Promise<TrendAnalysis>;
}

interface ClinicalSummary {
  patient: PatientDemographics;
  activeConditions: Condition[];
  activeMedications: Medication[];
  recentLabs: LabResult[];
  keyFindings: KeyFinding[];
  timeline: TimelineEvent[];
  riskFactors: RiskFactor[];
  recommendations: Recommendation[];
}
```

**Summary Generation Algorithm:**

1. Fetch all FHIR resources for patient
2. Filter by relevance (active conditions, recent observations)
3. Group by clinical domain (cardiovascular, metabolic, etc.)
4. Extract key findings using NLP
5. Identify trends in lab values
6. Calculate risk scores
7. Generate natural language summary
8. Translate to requested language
9. Format for display (web/mobile/print)

#### 3.2 Clinical Note Automation

**AI-Powered Note Generation:**
```python
class ClinicalNoteGenerator:
    def __init__(self):
        self.bedrock_client = boto3.client('bedrock-runtime')
        self.model_id = "anthropic.claude-3-sonnet-20240229-v1:0"
        self.validator = ClinicalNoteValidator()
    
    def generate_visit_note(self, encounter: Encounter) -> VisitNote:
        # Gather context
        context = self.build_context(encounter)
        
        # Prepare prompt for Bedrock
        prompt = self.create_soap_prompt(context)
        
        # Call Bedrock
        response = self.bedrock_client.invoke_model(
            modelId=self.model_id,
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 2000,
                "messages": [{
                    "role": "user",
                    "content": prompt
                }]
            })
        )
        
        # Parse response
        result = json.loads(response['body'].read())
        note_text = result['content'][0]['text']
        
        # Parse SOAP sections
        note = self.parse_soap_note(note_text)
        
        # Validate
        validation = self.validator.validate(note)
        
        return VisitNote(note, validation, confidence_score)
    
    def learn_from_feedback(self, note_id: str, corrections: dict):
        # Store corrections for fine-tuning or prompt improvement
        self.feedback_store.save(note_id, corrections)
```

**Note Types:**
- SOAP notes (Subjective, Objective, Assessment, Plan)
- Discharge summaries
- Procedure notes
- Progress notes
- Consultation notes

### 4. AI/ML Service

**Purpose:** Machine learning models for clinical intelligence

#### 4.1 Model Architecture

**Models:**

1. **Medical NER (Named Entity Recognition)**
   - Extract: diseases, medications, procedures, lab values
   - Training: Indian medical text corpus
   - Framework: spaCy + custom transformer

2. **Clinical Summarization**
   - Input: Patient FHIR resources
   - Output: Natural language summary
   - Model: AWS Bedrock (Claude 3 for medical reasoning)
   - Fallback: Fine-tuned LLM for offline scenarios

3. **Risk Prediction**
   - Diabetes risk score
   - Cardiovascular risk score
   - Chronic disease progression
   - Model: Gradient boosting + neural networks

4. **Recommendation Engine**
   - Lifestyle recommendations
   - Dietary suggestions
   - Exercise plans
   - Model: Collaborative filtering + rule-based

5. **ICD-10 Code Suggestion**
   - Input: Clinical notes
   - Output: Ranked ICD-10 codes
   - Model: Multi-label classification

6. **Lab Order Prediction**
   - Input: Diagnosis, symptoms
   - Output: Recommended lab tests
   - Model: Association rules + neural network

#### 4.2 Model Training Pipeline

```python
class ModelTrainingPipeline:
    def train_model(self, model_type: str, dataset: Dataset):
        # Data preparation
        train_data, val_data, test_data = self.split_data(dataset)
        
        # Preprocessing
        train_data = self.preprocess(train_data)
        
        # Training
        model = self.initialize_model(model_type)
        model.train(train_data, val_data)
        
        # Evaluation
        metrics = self.evaluate(model, test_data)
        
        # Bias detection
        bias_report = self.detect_bias(model, test_data)
        
        # Model versioning
        self.save_model(model, metrics, bias_report)
        
        return model, metrics
```

**Training Data Sources:**
- De-identified patient records (with consent)
- Public Indian health datasets
- Synthetic data generation
- Clinician-annotated examples

#### 4.3 AWS Bedrock Integration

**Bedrock Models Used:**

1. **Claude 3 Sonnet** - Primary model for clinical tasks
   - Clinical note generation (SOAP notes)
   - Patient summary generation
   - Medical question answering
   - Diagnosis explanation in simple language

2. **Claude 3 Haiku** - Fast model for real-time tasks
   - Quick patient queries via WhatsApp
   - IVR voice assistant responses
   - Medication reminders content

3. **Amazon Titan Text** - Embeddings and search
   - Medical document search
   - Semantic similarity for diagnosis matching
   - Patient record retrieval

4. **Llama 3** - Open-source alternative
   - Backup model for cost optimization
   - On-premises deployment option
   - Custom fine-tuning for Indian medical context

**Bedrock Implementation:**

```python
class BedrockService:
    def __init__(self):
        self.client = boto3.client('bedrock-runtime', region_name='ap-south-1')
        self.models = {
            'clinical': 'anthropic.claude-3-sonnet-20240229-v1:0',
            'fast': 'anthropic.claude-3-haiku-20240307-v1:0',
            'embeddings': 'amazon.titan-embed-text-v1',
            'opensource': 'meta.llama3-70b-instruct-v1:0'
        }
    
    def generate_clinical_summary(self, patient_data: dict) -> str:
        prompt = f"""You are a medical AI assistant for Indian healthcare.
        
Patient Data:
{json.dumps(patient_data, indent=2)}

Generate a concise clinical summary in simple language that:
1. Highlights active medical conditions
2. Lists current medications
3. Notes recent lab results with trends
4. Identifies risk factors
5. Provides actionable recommendations

Format the summary for both doctors and patients."""

        response = self.client.invoke_model(
            modelId=self.models['clinical'],
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1500,
                "temperature": 0.3,
                "messages": [{
                    "role": "user",
                    "content": prompt
                }]
            })
        )
        
        result = json.loads(response['body'].read())
        return result['content'][0]['text']
    
    def translate_to_regional_language(self, text: str, language: str) -> str:
        # Use AWS Translate for regional languages
        translate = boto3.client('translate', region_name='ap-south-1')
        
        result = translate.translate_text(
            Text=text,
            SourceLanguageCode='en',
            TargetLanguageCode=language
        )
        
        return result['TranslatedText']
    
    def generate_embeddings(self, text: str) -> list:
        response = self.client.invoke_model(
            modelId=self.models['embeddings'],
            body=json.dumps({
                "inputText": text
            })
        )
        
        result = json.loads(response['body'].read())
        return result['embedding']
```

**Bedrock Guardrails:**

```python
class BedrockGuardrails:
    def __init__(self):
        self.client = boto3.client('bedrock', region_name='ap-south-1')
        self.guardrail_id = self.create_medical_guardrail()
    
    def create_medical_guardrail(self):
        response = self.client.create_guardrail(
            name='HridaySetu-Medical-Guardrail',
            description='Guardrails for medical AI responses',
            topicPolicyConfig={
                'topicsConfig': [
                    {
                        'name': 'Medical Advice Disclaimer',
                        'definition': 'Always include disclaimer that AI advice is not a substitute for professional medical consultation',
                        'type': 'DENY'
                    },
                    {
                        'name': 'Harmful Medical Advice',
                        'definition': 'Prevent generation of harmful or dangerous medical advice',
                        'type': 'DENY'
                    }
                ]
            },
            contentPolicyConfig={
                'filtersConfig': [
                    {'type': 'HATE', 'inputStrength': 'HIGH', 'outputStrength': 'HIGH'},
                    {'type': 'VIOLENCE', 'inputStrength': 'HIGH', 'outputStrength': 'HIGH'},
                    {'type': 'SEXUAL', 'inputStrength': 'HIGH', 'outputStrength': 'HIGH'}
                ]
            },
            wordPolicyConfig={
                'wordsConfig': [
                    {'text': 'guaranteed cure'},
                    {'text': 'miracle treatment'}
                ],
                'managedWordListsConfig': [
                    {'type': 'PROFANITY'}
                ]
            }
        )
        
        return response['guardrailId']
```

**Cost Optimization:**

- Use Claude Haiku for high-volume, low-complexity tasks
- Cache frequently accessed prompts
- Batch processing for non-urgent summaries
- Use embeddings for semantic search instead of full LLM calls
- Implement request throttling and rate limiting

### 5. Patient Service

**Purpose:** Patient-facing features and multi-channel access

#### 5.1 Patient Portal API

```typescript
interface PatientService {
  // Record access
  getHealthRecords(patientId: string, filters: RecordFilters): Promise<HealthRecord[]>;
  getHealthSummary(patientId: string, language: string): Promise<Summary>;
  downloadRecord(recordId: string, format: 'pdf' | 'json'): Promise<File>;
  shareRecord(recordId: string, recipient: string): Promise<ShareLink>;
  
  // Health insights
  getPersonalizedRecommendations(patientId: string): Promise<Recommendation[]>;
  getRiskAlerts(patientId: string): Promise<Alert[]>;
  getUpcomingReminders(patientId: string): Promise<Reminder[]>;
  
  // Engagement
  markReminderComplete(reminderId: string): Promise<void>;
  provideFeedback(recommendationId: string, feedback: Feedback): Promise<void>;
  askHealthQuestion(patientId: string, question: string): Promise<Answer>;
}
```

#### 5.2 WhatsApp Bot Integration

**Architecture:**
```
WhatsApp Business API
    ↓
Webhook Handler (Express.js)
    ↓
Message Router
    ↓
┌─────────────┬─────────────┬─────────────┐
│   Intent    │  Dialogue   │   Action    │
│ Classifier  │  Manager    │  Executor   │
└─────────────┴─────────────┴─────────────┘
    ↓
Patient Service / FHIR Server
```

**Supported Commands:**
- "Show my latest reports"
- "What is my blood sugar level?"
- "Remind me to take medicine"
- "Book appointment"
- "Explain my diagnosis"
- "Diet suggestions for diabetes"

**Multi-language Support:**
- Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam
- Language detection from user input
- Translation layer for responses

#### 5.3 IVR System

**Call Flow:**
```
1. Authentication (Phone number + OTP/PIN)
2. Main Menu
   - Press 1: Latest reports
   - Press 2: Upcoming appointments
   - Press 3: Medication reminders
   - Press 4: Speak to assistant (voice AI)
3. Voice AI (Speech-to-Text → NLP → Text-to-Speech)
4. Confirmation & Goodbye
```

### 6. Workflow Service

**Purpose:** Task automation and clinical workflow management

#### 6.1 Workflow Engine

```typescript
interface WorkflowEngine {
  // Task management
  createTask(task: Task): Promise<string>;
  assignTask(taskId: string, userId: string): Promise<void>;
  updateTaskStatus(taskId: string, status: TaskStatus): Promise<void>;
  getTasksByUser(userId: string): Promise<Task[]>;
  
  // Automation
  suggestLabOrders(encounterId: string): Promise<LabOrder[]>;
  suggestICD10Codes(clinicalNote: string): Promise<ICD10Code[]>;
  generatePrescription(encounterId: string): Promise<Prescription>;
  
  // Notifications
  sendTaskReminder(taskId: string): Promise<void>;
  notifyTaskCompletion(taskId: string): Promise<void>;
}
```

**Workflow Types:**
1. **Patient Registration Workflow**
   - Verify identity
   - Create FHIR Patient resource
   - Link to ABHA (if available)
   - Send welcome notification

2. **Visit Workflow**
   - Check-in
   - Vitals recording
   - Doctor consultation
   - Lab orders
   - Prescription generation
   - Billing
   - Check-out

3. **Lab Result Workflow**
   - Receive lab results
   - Parse and normalize
   - Flag abnormal values
   - Notify doctor
   - Notify patient
   - Update care plan

4. **Preventive Care Workflow**
   - Identify due screenings
   - Send reminders
   - Track completion
   - Update patient record

### 7. Notification Service

**Purpose:** Multi-channel notifications and reminders

#### 7.1 Notification Channels

```typescript
interface NotificationService {
  sendNotification(notification: Notification): Promise<void>;
  scheduleNotification(notification: Notification, schedule: Schedule): Promise<string>;
  cancelNotification(notificationId: string): Promise<void>;
  getNotificationHistory(userId: string): Promise<Notification[]>;
}

interface Notification {
  userId: string;
  type: NotificationType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: Channel[]; // ['app', 'whatsapp', 'sms', 'email']
  content: NotificationContent;
  language: string;
}
```

**Notification Types:**
- Lab results available
- Appointment reminders
- Medication reminders
- Preventive screening due
- Health risk alerts
- System announcements

### 8. Research Service

**Purpose:** De-identified data access for research

#### 8.1 De-identification Engine

```python
class DeidentificationEngine:
    def deidentify_patient_data(self, patient_id: str) -> DeidentifiedRecord:
        # Fetch FHIR resources
        resources = self.fhir_client.get_patient_resources(patient_id)
        
        # Remove direct identifiers
        resources = self.remove_identifiers(resources)
        # Remove: name, address, phone, email, SSN, medical record number
        
        # Generalize quasi-identifiers
        resources = self.generalize_data(resources)
        # Age → age range, Date → year/month only, Location → district level
        
        # Suppress rare values
        resources = self.suppress_rare_values(resources)
        
        # Generate pseudonym
        pseudo_id = self.generate_pseudonym(patient_id)
        
        # Validate k-anonymity
        if not self.validate_k_anonymity(resources, k=5):
            resources = self.further_generalize(resources)
        
        return DeidentifiedRecord(pseudo_id, resources)
```

**De-identification Rules:**
- Remove: Name, address, phone, email, Aadhaar, ABHA
- Generalize: Age (5-year bins), dates (month/year), location (district)
- Suppress: Rare diagnoses, unique combinations
- Ensure k-anonymity (k ≥ 5)

#### 8.2 Cohort Builder

```typescript
interface CohortBuilder {
  defineCohort(criteria: CohortCriteria): Promise<Cohort>;
  getCohortStatistics(cohortId: string): Promise<Statistics>;
  compareCohorts(cohortIds: string[]): Promise<Comparison>;
  exportCohortData(cohortId: string, format: 'csv' | 'json'): Promise<File>;
}

interface CohortCriteria {
  ageRange?: [number, number];
  gender?: 'male' | 'female' | 'other';
  conditions?: string[]; // ICD-10 codes
  medications?: string[];
  labValues?: LabValueCriteria[];
  dateRange?: [Date, Date];
  location?: string[];
}
```

### 9. Analytics Service

**Purpose:** Dashboards and insights for providers and administrators

#### 9.1 Provider Dashboard

**Metrics:**
- Patient volume trends
- Average visit duration
- Documentation time saved
- AI summary usage rate
- Patient satisfaction scores
- Clinical outcome metrics

#### 9.2 Public Health Dashboard

**Metrics:**
- Disease prevalence by region
- Screening compliance rates
- Vaccination coverage
- Chronic disease trends
- Healthcare utilization patterns
- Social determinants of health

## Data Security & Privacy

### 10.1 Encryption

**Data at Rest:**
- AES-256 encryption for database
- Encrypted file storage (S3 with KMS)
- Encrypted backups

**Data in Transit:**
- TLS 1.3 for all API communication
- Certificate pinning for mobile apps
- VPN for internal service communication

### 10.2 Access Control

**Role-Based Access Control (RBAC):**

```typescript
enum Role {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  ADMIN = 'admin',
  RESEARCHER = 'researcher',
  BILLING = 'billing'
}

interface Permission {
  resource: string; // e.g., 'Patient', 'Observation'
  actions: Action[]; // ['read', 'write', 'delete']
  conditions?: Condition[]; // e.g., only own patients
}

const rolePermissions: Record<Role, Permission[]> = {
  [Role.PATIENT]: [
    { resource: 'Patient', actions: ['read'], conditions: ['self'] },
    { resource: 'Observation', actions: ['read'], conditions: ['self'] },
    // ... can only access own data
  ],
  [Role.DOCTOR]: [
    { resource: 'Patient', actions: ['read', 'write'], conditions: ['assigned'] },
    { resource: 'Observation', actions: ['read', 'write'], conditions: ['assigned'] },
    // ... can access assigned patients
  ],
  // ... other roles
};
```

**Attribute-Based Access Control (ABAC):**
- Patient consent status
- Data sensitivity level
- Purpose of access (treatment, research, billing)
- Time-based access (temporary access for consultations)

### 10.3 Audit Logging

```typescript
interface AuditLog {
  timestamp: Date;
  userId: string;
  userRole: Role;
  action: string; // 'read', 'write', 'delete', 'export'
  resource: string; // 'Patient/123'
  resourceType: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  reason?: string; // for failures
}
```

**Audit Requirements:**
- Log all data access
- Log all modifications
- Log all exports
- Immutable audit trail
- Retention: 7 years minimum
- Real-time anomaly detection

### 10.4 Consent Management

```typescript
interface ConsentService {
  recordConsent(consent: Consent): Promise<string>;
  revokeConsent(consentId: string): Promise<void>;
  checkConsent(patientId: string, purpose: Purpose): Promise<boolean>;
  getConsentHistory(patientId: string): Promise<Consent[]>;
}

interface Consent {
  patientId: string;
  purpose: Purpose; // 'treatment', 'research', 'analytics'
  scope: Scope; // 'all_data', 'specific_resources'
  grantedAt: Date;
  expiresAt?: Date;
  revokedAt?: Date;
  signature: string; // digital signature
}
```

**Consent Types:**
- Treatment consent (default, required)
- Research consent (optional, granular)
- Data sharing consent (optional)
- Marketing consent (optional)

## API Design

### 11.1 RESTful API Endpoints

**Authentication:**
```
POST /auth/login
POST /auth/logout
POST /auth/refresh
POST /auth/otp/send
POST /auth/otp/verify
```

**Patient API:**
```
GET    /api/v1/patients/{id}
GET    /api/v1/patients/{id}/summary
GET    /api/v1/patients/{id}/timeline
GET    /api/v1/patients/{id}/records
GET    /api/v1/patients/{id}/recommendations
GET    /api/v1/patients/{id}/reminders
POST   /api/v1/patients/{id}/share
```

**Clinical API:**
```
POST   /api/v1/encounters
GET    /api/v1/encounters/{id}
POST   /api/v1/encounters/{id}/notes
GET    /api/v1/encounters/{id}/summary
POST   /api/v1/observations
POST   /api/v1/conditions
POST   /api/v1/medications
```

**Ingestion API:**
```
POST   /api/v1/ingest/hl7
POST   /api/v1/ingest/fhir
POST   /api/v1/ingest/csv
POST   /api/v1/ingest/document
POST   /api/v1/ingest/voice
```

**FHIR API (HAPI FHIR):**
```
GET    /fhir/Patient/{id}
GET    /fhir/Observation?patient={id}
POST   /fhir/Patient
PUT    /fhir/Patient/{id}
DELETE /fhir/Patient/{id}
```

### 11.2 API Authentication

**OAuth 2.0 + JWT:**

```typescript
interface JWTPayload {
  sub: string; // user ID
  role: Role;
  permissions: string[];
  iat: number; // issued at
  exp: number; // expiration
  iss: string; // issuer
}

// Access token: 15 minutes
// Refresh token: 7 days
// MFA required for sensitive operations
```

**API Rate Limiting:**
- Public endpoints: 100 requests/minute
- Authenticated endpoints: 1000 requests/minute
- Bulk operations: 10 requests/minute
- Research exports: 5 requests/hour

## Database Design

### 12.1 FHIR Database Schema

**PostgreSQL with HAPI FHIR:**
- Normalized FHIR resource storage
- Optimized search indexes
- Full-text search support
- Partitioning by date for large tables

**Key Tables:**
- `hfj_resource` - All FHIR resources
- `hfj_res_ver` - Resource versions
- `hfj_spidx_string` - String search parameters
- `hfj_spidx_token` - Token search parameters
- `hfj_spidx_date` - Date search parameters
- `hfj_spidx_number` - Number search parameters

### 12.2 Application Database

**MongoDB Collections:**
```javascript
// Audit logs
{
  _id: ObjectId,
  timestamp: ISODate,
  userId: String,
  action: String,
  resource: String,
  metadata: Object
}

// AI model metadata
{
  _id: ObjectId,
  modelName: String,
  version: String,
  trainingDate: ISODate,
  metrics: Object,
  biasReport: Object
}

// User preferences
{
  _id: ObjectId,
  userId: String,
  language: String,
  notificationPreferences: Object,
  consentRecords: Array
}
```

### 12.3 Caching Strategy

**Redis Cache:**
- Patient summaries (TTL: 1 hour)
- Frequently accessed records (TTL: 30 minutes)
- API responses (TTL: 5 minutes)
- Session data (TTL: 15 minutes)
- Rate limiting counters (TTL: 1 minute)

**Cache Invalidation:**
- On data update: invalidate related caches
- On patient record change: invalidate patient summary
- On new observation: invalidate timeline cache

## Deployment Architecture

### 13.1 Kubernetes Deployment

**Cluster Structure:**
```yaml
Namespaces:
  - production
  - staging
  - development

Node Pools:
  - api-pool (CPU-optimized)
  - ml-pool (GPU-enabled)
  - data-pool (memory-optimized)

Services:
  - api-gateway (3 replicas)
  - ingestion-service (5 replicas)
  - clinical-service (5 replicas)
  - patient-service (5 replicas)
  - ai-service (3 replicas, GPU)
  - workflow-service (3 replicas)
  - notification-service (3 replicas)
  - fhir-server (5 replicas)
```

### 13.2 Scaling Strategy

**Horizontal Pod Autoscaling:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

**Database Scaling:**
- PostgreSQL: Read replicas for FHIR queries
- MongoDB: Sharding by user ID
- Redis: Cluster mode with replication

### 13.3 Disaster Recovery

**Backup Strategy:**
- Database: Daily full backup + continuous WAL archiving
- Object storage: Cross-region replication
- Configuration: Version controlled in Git
- Recovery Time Objective (RTO): 4 hours
- Recovery Point Objective (RPO): 15 minutes

**High Availability:**
- Multi-AZ deployment
- Database replication (primary + 2 replicas)
- Load balancer health checks
- Automatic failover

## Monitoring & Observability

### 14.1 Metrics

**Application Metrics:**
- Request rate, latency, error rate (RED metrics)
- API endpoint performance
- Database query performance
- Cache hit rate
- AI model inference time
- Queue depth and processing time

**Business Metrics:**
- Active users (daily, monthly)
- Patient registrations
- Records ingested
- Summaries generated
- Notifications sent
- API usage by client

### 14.2 Logging

**Log Levels:**
- ERROR: System errors, exceptions
- WARN: Degraded performance, retries
- INFO: Business events, API calls
- DEBUG: Detailed debugging information

**Structured Logging:**
```json
{
  "timestamp": "2026-02-14T10:30:00Z",
  "level": "INFO",
  "service": "clinical-service",
  "traceId": "abc123",
  "userId": "user456",
  "action": "generate_summary",
  "duration": 1234,
  "status": "success"
}
```

### 14.3 Alerting

**Critical Alerts:**
- Service down (> 1 minute)
- Error rate > 5%
- API latency > 2 seconds (p95)
- Database connection failures
- Disk space > 85%
- Security incidents

**Warning Alerts:**
- Error rate > 1%
- API latency > 1 second (p95)
- Cache hit rate < 70%
- Queue backlog > 1000 messages

## Testing Strategy

### 15.1 Unit Testing

**Coverage Target:** 80%+

**Framework:** Jest (TypeScript), pytest (Python)

**Focus Areas:**
- Business logic
- Data transformations
- FHIR resource mapping
- AI model predictions
- Validation functions

### 15.2 Integration Testing

**Test Scenarios:**
- End-to-end data ingestion
- FHIR resource creation and retrieval
- Clinical summary generation
- Multi-service workflows
- Authentication and authorization

### 15.3 Performance Testing

**Load Testing:**
- Simulate 10,000 concurrent users
- Test API endpoints under load
- Measure response times at scale
- Identify bottlenecks

**Stress Testing:**
- Push system beyond normal capacity
- Test failure modes
- Verify graceful degradation

### 15.4 Security Testing

**Penetration Testing:**
- API security vulnerabilities
- Authentication bypass attempts
- SQL injection, XSS
- Data access control validation

**Compliance Testing:**
- FHIR compliance validation
- Privacy regulation compliance
- Audit log completeness

## Migration & Integration

### 16.1 EMR Integration

**Integration Patterns:**

1. **Plugin/Extension:** Embed HridaySetu within existing EMR
2. **API Integration:** EMR pushes data via REST API
3. **HL7 Feed:** Real-time HL7 message streaming
4. **Batch Upload:** Periodic CSV/file uploads
5. **FHIR Sync:** Bidirectional FHIR synchronization

**Supported EMRs:**
- OpenMRS
- Bahmni
- Hospital Management Systems (HMS)
- Custom EMRs via API

### 16.2 NDHM/ABHA Integration

**Integration Points:**
- Patient identity verification via ABHA
- Health record linking
- Consent management via NDHM consent manager
- Health information exchange

**ABDM Building Blocks:**
- Health ID (ABHA)
- Health Data Management Policy
- Health Information Exchange and Consent Manager (HIE-CM)
- Health Repository Provider (HRP)

### 16.3 Data Migration

**Migration Strategy:**
1. **Assessment:** Analyze existing data sources
2. **Mapping:** Define source-to-FHIR mappings
3. **Validation:** Test mappings with sample data
4. **Pilot:** Migrate subset of data
5. **Full Migration:** Batch migration with validation
6. **Verification:** Ensure data integrity
7. **Cutover:** Switch to new system

## Correctness Properties

### Property 1: Data Integrity
**Description:** All ingested data must be accurately stored and retrievable without loss or corruption.

**Validation:**
- Property-based test: For any valid input data, ingestion followed by retrieval returns equivalent data
- Test framework: Hypothesis (Python) / fast-check (TypeScript)
- Generators: Random FHIR resources, HL7 messages, CSV files

### Property 2: FHIR Compliance
**Description:** All generated FHIR resources must conform to FHIR R4 specification.

**Validation:**
- Property-based test: All generated resources pass FHIR validator
- Use official FHIR validator library
- Test across all resource types

### Property 3: Access Control Correctness
**Description:** Users can only access data they have permission to access.

**Validation:**
- Property-based test: For any user and resource, access is granted if and only if permissions allow
- Test all role combinations
- Test consent-based access

### Property 4: De-identification Completeness
**Description:** De-identified data contains no direct identifiers and satisfies k-anonymity.

**Validation:**
- Property-based test: De-identified records contain no PII
- Verify k-anonymity (k ≥ 5)
- Test re-identification resistance

### Property 5: Encryption Integrity
**Description:** All sensitive data is encrypted at rest and in transit.

**Validation:**
- Property-based test: Data stored in database is encrypted
- API responses use TLS
- Verify encryption keys are properly managed

### Property 6: Audit Completeness
**Description:** All data access and modifications are logged in audit trail.

**Validation:**
- Property-based test: Every API call generates corresponding audit log
- Audit logs are immutable
- No gaps in audit trail

### Property 7: Notification Delivery
**Description:** All scheduled notifications are delivered to intended recipients.

**Validation:**
- Property-based test: Scheduled notification results in delivery attempt
- Retry logic for failures
- Delivery confirmation tracking

### Property 8: AI Model Consistency
**Description:** AI models produce consistent outputs for identical inputs.

**Validation:**
- Property-based test: Same input produces same output (deterministic)
- Model versioning ensures reproducibility
- Test across model updates

### Property 9: Consent Enforcement
**Description:** Research data exports only include patients with valid consent.

**Validation:**
- Property-based test: All exported records have active consent
- Revoked consent excludes data
- Expired consent excludes data

### Property 10: Multi-language Consistency
**Description:** Translations preserve semantic meaning across languages.

**Validation:**
- Property-based test: Back-translation preserves key medical terms
- Critical information is not lost in translation
- Test across all supported languages

## Implementation Phases

### Phase 1: Foundation (Months 1-6)
**Deliverables:**
- FHIR server setup (HAPI FHIR)
- Basic data ingestion (HL7, CSV, PDF)
- Patient and provider authentication
- Clinical summary MVP
- Provider dashboard
- Security infrastructure (encryption, RBAC)

**Success Criteria:**
- Ingest 1000+ patient records
- Generate summaries in < 3 seconds
- 99% uptime
- Pass security audit

### Phase 2: AI & Automation (Months 7-12)
**Deliverables:**
- Clinical note automation
- AI-powered recommendations
- Preventive care reminders
- Patient mobile app (iOS/Android)
- WhatsApp bot
- Workflow automation

**Success Criteria:**
- 80% of visits use AI summaries
- 10+ minutes saved per visit
- 60% patient app adoption
- 90%+ AI accuracy

### Phase 3: Scale & Research (Months 13-18)
**Deliverables:**
- IVR system
- Regional language support (8+ languages)
- Research tools (cohort builder, de-identification)
- Analytics dashboards
- Multi-state deployment
- EMR integrations

**Success Criteria:**
- 50+ healthcare facilities
- 100,000+ patients
- 5+ research projects
- Multi-language support

### Phase 4: National Integration (Months 19-24)
**Deliverables:**
- NDHM/ABHA integration
- Public health dashboards
- Advanced analytics
- Policy advocacy
- National rollout

**Success Criteria:**
- 500+ healthcare facilities
- 1M+ patients
- Government partnerships
- National health impact

## Open Questions & Future Considerations

1. **Ayurvedic/Traditional Medicine:** How to integrate non-allopathic treatments?
2. **Offline Support:** How to handle areas with poor connectivity?
3. **Blockchain:** Should we use blockchain for audit trails?
4. **Federated Learning:** Can we train models without centralizing data?
5. **Voice AI Quality:** What accuracy is acceptable for voice interactions?
6. **Regulatory Approval:** What medical device regulations apply?
7. **Insurance Integration:** How to integrate with insurance claims?
8. **Telemedicine:** Should we add video consultation features?

## Appendix

### A. Technology Alternatives Considered

| Component | Chosen | Alternatives | Rationale |
|-----------|--------|--------------|-----------|
| FHIR Server | HAPI FHIR | Firely, IBM FHIR | Open-source, mature, active community |
| Backend | Node.js/Python | Java, Go | Developer familiarity, AI/ML ecosystem |
| Database | PostgreSQL | MySQL, MongoDB | FHIR support, ACID compliance |
| Mobile | React Native | Flutter, Native | Code reuse, large ecosystem |
| Cloud | AWS | Azure, GCP | Market leader, comprehensive services |
| ML Framework | PyTorch | TensorFlow | Research-friendly, dynamic graphs |

### B. Glossary

- **FHIR:** Fast Healthcare Interoperability Resources
- **HL7:** Health Level 7 International
- **HAPI:** HL7 Application Programming Interface
- **NER:** Named Entity Recognition
- **SOAP:** Subjective, Objective, Assessment, Plan
- **RBAC:** Role-Based Access Control
- **ABAC:** Attribute-Based Access Control
- **JWT:** JSON Web Token
- **ABHA:** Ayushman Bharat Health Account
- **NDHM:** National Digital Health Mission
- **ABDM:** Ayushman Bharat Digital Mission

### C. References

- FHIR R4: https://hl7.org/fhir/R4/
- HAPI FHIR: https://hapifhir.io/
- NDHM: https://ndhm.gov.in/
- SNOMED CT: https://www.snomed.org/
- LOINC: https://loinc.org/
- ICD-10: https://www.who.int/classifications/icd/

---

