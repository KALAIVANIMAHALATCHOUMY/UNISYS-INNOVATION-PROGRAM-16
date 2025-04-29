import os
import langgraph.graph as lg
from langchain_groq import ChatGroq
from langchain.schema import SystemMessage, HumanMessage
from typing import Dict, Optional
from dotenv import load_dotenv
from pydantic import BaseModel
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from datetime import datetime, timedelta
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END
import re

# Load environment variables
load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")


# Initialize LLM
llm = ChatGroq(model_name="llama3-70b-8192", temperature=0, groq_api_key=groq_api_key)

# Initialize embedding and vector store
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vector_store = Chroma(embedding_function=embedding_model)


# Set default document paths for RAG
DEFAULT_IT_DOC_PATH = "D:/ReactFlow/It_support_agent.pdf"
DEFAULT_HR_DOC_PATH = "D:/ReactFlow/hr_assistance.pdf"
DEFAULT_WELLNESS_DOC_PATH="D:/ReactFlow/wellness.pdf"
DEFAULT_PRODUCTIVITY_DOC_PATH="D:/ReactFlow/productivity.pdf"
DEFAULT_RISK_DOC_PATH="D:/ReactFlow/risk.pdf"
DEFAULT_TASK_SKILL_PATH ="D:/ReactFlow/task_estimation.pdf"

def normalize_document_content(documents):
    for doc in documents:
        doc.page_content = re.sub(r"([A-Za-z]+)\n\s*([a-z])", r"\1\2", doc.page_content)
        doc.page_content = re.sub(r"\n(?=\w)", " ", doc.page_content)
    return documents

def load_and_index_documents(document_path: str, query: str):
    global vector_store
    if vector_store._collection is None:
        vector_store.get_collection()

    print(f"📂 Loading document from: {document_path}")
    loader = PyPDFLoader(document_path) if document_path.endswith(".pdf") else TextLoader(document_path)
    documents = loader.load()
    documents = normalize_document_content(documents)
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    split_docs = text_splitter.split_documents(documents)
    print(f"📂 Loaded {len(split_docs)} chunks from {document_path}")
    filtered_docs = [doc for doc in split_docs if doc and getattr(doc, "page_content", None)]
    vector_store.add_documents(filtered_docs)
    if not isinstance(query, str) or not query.strip():
        query = "default"
    try:
        relevant_docs = vector_store.similarity_search(query, k=3)
        print(f"✅ Retrieved {len(relevant_docs)} relevant documents.")
        return [doc.page_content for doc in relevant_docs if doc and getattr(doc, "page_content", None)]
    except Exception as e:
        print(f"❌ Error during similarity search: {e}")
        return []
# Define state
class State(BaseModel):
    query: str
    document_path: Optional[str] = None
    it_response: Optional[str] = None
    hr_response: Optional[str] = None
    wellness: Optional[str] = None
    productivity: Optional[str] = None
    risk: Optional[str] = None
    web_search_response: Optional[str] = None
    doc_search_response: Optional[str] = None
    task: Optional[str] = None
    assigned_to: Optional[str] = None
    estimated_completion: Optional[str] = None
    leave_days: Optional[int] = 0
    actual_working_days: Optional[int] = 0
    formatted_answer: Optional[str] = None

# Query getter
def get_query(state: State) -> str:
    return state.query

# Documentation search
def documentation_search(state: State) -> Dict:
    if not state.document_path or not os.path.exists(state.document_path):
        return {"doc_search_response": "❌ Invalid or missing document path."}
    
    doc_texts = load_and_index_documents(state.document_path, state.query)
    response = llm.invoke([
        SystemMessage(content="""
    You are a smart Document Search Agent. You assist users by finding accurate answers using specific documents or manuals provided.
    You will receive a user query and a relevant document path. Your job is to:
    1. Load and read the document
    2. Extract the most relevant parts
    3. Summarize or rephrase information based on user needs

    Do not make up content. Stay strictly grounded in the document contents.
    Your role is neutral—do not act as HR or IT unless specified.
    """),
        HumanMessage(content=f"Query: {state.query}\nRelevant Docs:\n{' '.join(doc_texts)}")
    ])
    return {"doc_search_response": response.content}


# IT support with RAG
def it_support(state: State) -> Dict:
    docs = ""
    if os.path.exists(DEFAULT_IT_DOC_PATH):
        doc_texts = load_and_index_documents(DEFAULT_IT_DOC_PATH, state.query)
        docs = "\n".join(doc_texts)
    else:
        docs = "No relevant IT document found."

    response = llm.invoke([
        SystemMessage(content="""
    You are an expert IT Support Assistant. Your role is to help users resolve technical issues related to systems, software, hardware, and infrastructure. 
    You must strictly rely on the IT documentation provided and answer in a clear, step-by-step manner.
    Common queries include topics like:
    - password resets
    - VPN and network access
    - server or application errors
    - troubleshooting technical glitches

    Avoid HR or policy-related content. Only focus on IT issues and provide accurate, actionable guidance.
    """),
        HumanMessage(content=f"Query: {state.query}\nRelevant IT Docs:\n{docs}")
    ])
    return {"it_response": response.content}


# HR assistance with RAG
def hr_assistance(state: State) -> Dict:
    docs = ""
    if os.path.exists(DEFAULT_HR_DOC_PATH):
        doc_texts = load_and_index_documents(DEFAULT_HR_DOC_PATH, state.query)
        docs = "\n".join(doc_texts)
    else:
        docs = "No relevant HR document found."

    response = llm.invoke([
        SystemMessage(content="""
    You are an experienced HR Support Assistant. Your role is to assist users with human resource-related inquiries using the HR documentation provided.
    Topics may include:
    - leave and vacation policies
    - salary and payroll information
    - benefits and compensation
    - onboarding, offboarding, and employee records

    Avoid answering any technical/IT or infrastructure-related questions. Your answers must reflect HR policies and company guidelines.
    Provide friendly, formal, and policy-compliant answers.
    """),
        HumanMessage(content=f"Query: {state.query}\nRelevant HR Docs:\n{docs}")
    ])
    return {"hr_response": response.content}


# Wellness assistance with RAG
def wellness(state: State) -> Dict:
    docs = ""
    if os.path.exists(DEFAULT_WELLNESS_DOC_PATH):
        doc_texts = load_and_index_documents(DEFAULT_WELLNESS_DOC_PATH, state.query)
        docs = "\n".join(doc_texts)
    else:
        docs = "No relevant Wellness document found."

    response = llm.invoke([
        SystemMessage(content="""
    You are a compassionate and attentive Wellness and Emotional Support Assistant. Your role is to support employees' mental and emotional well-being.

    Features:
    - Provide personalized wellness advice tailored to the user's emotional state and situation.
    - Detect signs of stress, burnout, or emotional fatigue using the language in the query.
    - Offer gentle, practical suggestions such as mindfulness practices, healthy habits, break routines, and mental health support options.
    - Promote a healthier work atmosphere by encouraging boundaries, rest, and self-care.
    - Guide users to internal wellness programs or counseling resources when relevant.

    Instructions:
    - Always respond empathetically and respectfully.
    - If emotional distress is detected, prioritize stress-relief suggestions or refer the user to a wellness counselor.
    - Avoid technical, HR, or task-oriented solutions unless clearly relevant to emotional well-being.
    """),
        HumanMessage(content=f"Query: {state.query}\nRelevant WELLNESS Docs:\n{docs}")
    ])
    return {"wellness": response.content}


# Productivity assistance with RAG
def productivity(state: State) -> Dict:
    docs = ""
    if os.path.exists(DEFAULT_PRODUCTIVITY_DOC_PATH):
        doc_texts = load_and_index_documents(DEFAULT_PRODUCTIVITY_DOC_PATH, state.query)
        docs = "\n".join(doc_texts)
    else:
        docs = "No relevant PRODUCTIVITY document found."

    response = llm.invoke([
        SystemMessage(content="""
    You are a strategic and focused Productivity Optimization Assistant. Your role is to help users improve work efficiency, task management, and collaboration.

    Features:
    - Recommend time management techniques such as time-blocking, Pomodoro, and prioritization frameworks.
    - Help users reduce tool overload, avoid context-switching, and streamline communication workflows.
    - Support cross-team alignment, ownership clarity, and meeting efficiency.
    - Offer advice on workload balancing, focus management, and reducing productivity blockers.

    Instructions:
    - Focus on optimizing how work is organized, executed, and communicated.
    - Do not provide HR, wellness, or emotional counseling unless it's related to task or time management.
    - Encourage goal-setting, visual task boards, async updates, and performance reflection.
    """),
        HumanMessage(content=f"Query: {state.query}\nRelevant PRODUCTIVITY Docs:\n{docs}")
    ])
    return {"productivity": response.content}


# Risk assistance with RAG
def risk(state: State) -> Dict:
    docs = ""
    if os.path.exists(DEFAULT_RISK_DOC_PATH):
        doc_texts = load_and_index_documents(DEFAULT_RISK_DOC_PATH, state.query)
        docs = "\n".join(doc_texts)
    else:
        docs = "No relevant RISK document found."

    response = llm.invoke([
        SystemMessage(content="""
    You are an intelligent and proactive Risk Management Assistant. Your role is to help users identify, assess, and mitigate project and operational risks.

    Features:
    - Analyze user inputs to detect signs of project blockers, testing gaps, tool dependencies, or lack of resource coverage.
    - Assist in impact analysis and probability estimation using past experience and current context.
    - Recommend risk mitigation strategies such as contingency planning, documentation, and reducing key-person dependencies.
    - Support decisions related to vendor/tool changes, sprint blockers, and release risks.

    Instructions:
    - Focus on identifying potential threats to project stability or delivery.
    - Do not offer technical debugging, HR advice, or wellness suggestions unless the issue clearly poses a risk.
    - Use structured reasoning and provide actionable mitigation steps with urgency if needed.
    """),
        HumanMessage(content=f"Query: {state.query}\nRelevant RISK Docs:\n{docs}")
    ])
    return {"risk": response.content}



# Web search simulation (LLM-based)
def web_search(state: State) -> Dict:
    response = llm.invoke([
        SystemMessage(content="""
    You are a Web Search Assistant that mimics searching the internet for general information.
    When the user's question doesn't clearly belong to HR, IT, or documentation, or when it refers to open-ended knowledge like:
    - definitions
    - best practices
    - trends or how-to guides not found in internal docs

    You simulate a web search and provide an informative, synthesized response as if retrieved from trusted public sources.
    Avoid hallucinating or providing overly confident answers if unsure.
    """),
        HumanMessage(content=get_query(state))
    ])
    return {"web_search_response": response.content}


# Task Assign assistance 
def assign_task(state: State) -> Dict:
    """Assigns a task to the most suitable person based on skills."""
    task_description = state.task or ""
    docs = load_and_index_documents(DEFAULT_TASK_SKILL_PATH, task_description)
    docs_content = "\n".join(docs) if docs else "No relevant documents found."
    system_message = """
    You are an assistant responsible for assigning tasks to people based on their specific skills, expertise, and current availability (leave schedules).

    Your role involves:
    - Understanding the task description and matching it with the skill sets of available people.
    - Determining which employees are best suited for the task by analyzing their documented skills, experience, and availability.
    - Considering employees' current leave schedules (e.g., holidays, planned absences) to determine if they can work on the task during the required time frame.
    - Ensuring that task assignments are efficient and aligned with the team's overall goals and deadlines.

    Instructions:
    1. **Matching Skills**: Match the task description with the most relevant skills of the employees. For example, if the task involves "Python programming," prioritize people with Python expertise.
    2. **Availability Check**: Verify the availability of the employee by cross-checking their leave schedules. If someone is on leave during the task duration, select another available employee with the relevant skill set.
    3. **Task Complexity**: Consider the complexity of the task when assigning it. If the task requires deep expertise or advanced skills, assign it to the person with the most suitable skill set and experience.
    4. **Documentation Review**: Use the indexed documents to retrieve information about people's skills, leave schedules, and experience. If the task involves specific domain knowledge (e.g., "Data Analysis"), look for people who have expertise in that area.
    5. **Task Assignment**: Once a suitable candidate is identified based on the task description, skill requirements, and availability, assign the task to that person. If no suitable match is found, indicate that no assignment could be made.
    6. **No HR/Wellness/Emotional Counseling**: Do not provide HR-related advice (e.g., wellness advice or emotional support) unless it's explicitly related to task management (e.g., dealing with task overload).

    Your job is to ensure that tasks are assigned to the right person at the right time, optimizing team efficiency and aligning with the overall project goals.
    """
    human_message = f"Query: {state.query}\nTask Description: {task_description}\nRelevant Documents: {docs_content}"
    response = llm.invoke([
        SystemMessage(content=system_message),
        HumanMessage(content=human_message)
    ])
    best_match = response.content
    print(f"✅ [Agent 1] Task assigned to: {best_match}")
    return {"task": task_description, "assigned_to": best_match}


# Task Estimation assistance 
def estimate_completion(state: State) -> Dict:
    """Estimates the completion time considering employee leave and weekends."""
    assigned_person = state.assigned_to
    if assigned_person == "No one":
        return {"estimated_completion": "No one assigned, cannot estimate time."}
    leave_days = set() 
    estimated_days = 5  
    today = datetime.today().date()
    completion_date = today
    days_counted = 0
    leave_days_taken = 0

    # Track leave days taken
    while days_counted < estimated_days:
        completion_date += timedelta(days=1)
        if completion_date.weekday() < 5:  # Weekdays
            if completion_date in leave_days:
                leave_days_taken += 1
            else:
                days_counted += 1

    formatted_answer = {
        "estimated_completion": str(completion_date),
        "leave_days_taken": leave_days_taken if leave_days_taken > 0 else "No leave days"
    }

    state.estimated_completion = str(completion_date)
    state.leave_days = leave_days_taken
    state.formatted_answer = formatted_answer
    return state


# Router
DOCUMENT_SEARCH_KEYWORDS = [
    "document", "manual", "reference guide", "user guide", "training material",
    "product manual", "specification", "design doc", "process document",
    "help file", "how-to document", "procedure guide", "technical document",
    "upload document", "simulink block", "pdf file", "open documentation",
    "read manual", "look up document", "attached file", "attached document",
    "attached manual", "attached pdf"
]
RISK_KEYWORDS = ["risk", "dependency risk", "vendor risk", "impact analysis", "contingency plan",
    "blocker", "fallback plan", "project delay", "sprint delay", "missed deadline",
    "underestimated", "recurring issue", "release delay", "unplanned blocker",
    "unassigned issues", "critical issues", "task ownership",
    "unassigned tasks", "delivery risk", "deadline risk",
    "project blocker", "unmitigated risk", "sprint risk", "schedule slip",
    "release blocker", "late delivery", "incomplete sprint", "timeline impact",
    "team availability", "key integration", "resource unavailability", "personnel dependency", 
    "integration delay", "third-party service", "authentication", "outages", "service disruption", "no fallback", 
    "system failure", "service interruption", "unavailability",
    "code review", "time pressure", "skip", "bugs", "post-release", "quality assurance", 
    "release risk", "code quality", "defects", "missed review", "testing delay", "high-priority tickets", 
    "multiple tasks", "workload", "overload", "task allocation", "quality", "velocity", "productivity", 
    "team capacity", "task impact", "resource strain", "plan", "cannot deliver", "stories", "blockers", 
    "impact mitigation", "task delay", "unresolved blockers","code reviews","time pressure","bugs post-release","risk","introduce bugs",
    "high-priority tickets","assigned to multiple tickets","affecting quality","affecting velocity","task overload","workload imbalance","resource overcommitment","delivery risk",            # Root concern
    "quality risk"]
PRODUCTIVITY_KEYWORDS = [
    "collaborate", "collaboration", "teammates",
    "messages", "scattered tools", "teams", "slack", "email overload",
    "communication tools", "updates", "missed updates", "missed deadlines", "deadlines",
    "impacting my productivity", "communication bottleneck", "context switching",
    "assigned tasks", "don’t align with", "core skills", "longer to complete",
    "causing delays", "delays for the team", "skill mismatch", "resource allocation",
    "task fit", "wrong assignments", "approvals", "waiting on approvals",
    "other departments", "causing standstills", "standstills",
    "don’t know who to escalate", "escalation", "workflow delay",
    "cross-functional dependency", "team is always busy", "unclear accomplishments",
    "week to week", "unclear what we’ve accomplished", "performance visibility",
    "goal alignment", "output tracking", "team productivity", "busy but not productive",
    "calendar is packed", "meetings", "meeting fatigue", "focused work", "working late",
    "no focus time", "time management", "deep work", "overbooked schedule",
    "catch up on work", "juggling too many projects", "too many projects",
    "switching between tools", "hurts my concentration", "concentration",
    "tool overload", "project overload", "multitasking", "focus loss",
    "flooded with pings", "jira", "email", "too many notifications", "focus",
    "hard to prioritize", "alert fatigue", "notification overload",
    "distraction", "task prioritization", "communication noise"]

WELLNESS_KEYWORDS = ["mental health", "burnout", "stress", "anxiety", "exhausted", "emotional fatigue",
    "workload balance", "sleep issues", "insomnia", "disconnect", "focus issues", "feeling overwhelmed",
    "lonely", "isolation", "remote work fatigue", "motivation", "well-being", "caregiving",
    "mindfulness", "resilience", "headaches", "blue light", "wellness support", "wellness team",
    "counseling", "imposter syndrome", "fatigue", "sluggish", "nutrition", "healthy eating",
    "productivity dip", "self-care", "work-life balance", "digital detox", "multitasking", "focus tools",
    "pomodoro", "breaks", "afternoon crash", "always online", "disconnecting", "stigma", "pressure",
    "leadership coaching", "confidence", "employee wellness", "emotional health", "wellness portal","feeling overwhelmed","affect my sleep","affect my mood","manage the stress","stress","burnout","emotional strain",
    "disconnected from my team","feel lonely","unmotivated","working remotely","remote isolation","lack of social connection",
    "emotional well-being","low motivation","social disconnection",
    "harder to feel motivated","don’t feel satisfied","don’t feel productive","low motivation","emotional disengagement","burnout symptoms","mental fatigue",
    "lack of fulfillment","big presentation","super anxious","I’ll mess up","performance anxiety","nervous about presentation","fear of failure",
    "anxiety","self-doubt","presentation stress","public speaking anxiety","struggling to balance work and personal life","always on","even after hours",
    "work-life balance","no boundaries","constant availability","digital burnout","overworking","personal time erosion","no one notices","feeling unnoticed","demotivating",
    "lack of recognition","feeling undervalued","lack of appreciation","low morale","self-doubt","workplace disconnection","feel fine some days",
    "crash emotionally","hard to predict","hard to manage","mood swings","emotional instability","emotional fluctuations","stress",
    "mental fatigue","unpredictable emotions","emotional exhaustion","crash emotionally","hard to predict or manage",
    "mood swings","emotional instability","emotional exhaustion","emotional ups and downs","unpredictable emotions","mental fatigue",
    "nonstop meetings","mentally drained","need space to think","mental exhaustion","meeting fatigue","burnout",
    "cognitive overload","need a break","mental recharge"]

HR_ASSISTANCE_KEYWORDS=["hr", "human resource", "employee self-service", "hr portal", "profile update",
    "leave", "apply for leave", "parental leave", "vacation", "maternity", "paternity", "adoption",
    "salary", "payslip", "payroll", "bank account", "salary certificate", "compensation",
    "benefits", "health insurance", "relocation", "bonus", "mental health", "wellness", "eap",
    "performance review", "review feedback", "internal transfer", "job transfer", "promotion",
    "resign", "exit process", "notice period", "grievance", "workplace injury", "harassment",
    "recognition", "employee award", "referral", "refer candidate", "working hours",
    "break policy", "update information", "edit profile", "learning and development", "l&d",
    "training", "counseling", "incident report", "onboarding", "offboarding", "employee handbook",
    "company policy", "employee record", "employee data", "HR policy", "HR guidelines"]

IT_SUPPORT_KEYWORDS=["it support", "vpn", "network", "connectivity", "internet issue", "server",
    "email", "reset password", "system password", "login issue", "account locked",
    "shared drive", "drive access", "hardware", "laptop", "printer", "device",
    "mobile setup", "software", "installation", "update software", "approved software",
    "phishing", "malware", "antivirus", "security", "it helpdesk", "it portal",
    "remote access", "files remotely", "video conferencing", "vc room", "meeting room",
    "mdm", "mobile device management", "performance issue", "system slow",
    "troubleshooting", "diagnostics", "disk cleanup", "technical issue",
    "asset request", "hardware upgrade", "software catalog", "outlook setup",
    "email configuration", "os update", "company device", "public wifi", "vpn access"]

WEB_SEARCH_KEYWORDS=["search", "find", "lookup", "google", "definition", "meaning",
    "latest", "trend", "example", "how to", "compare", "best way",
    "public info", "industry standard", "statistics", "current", "overview",
    "open source", "alternative", "history", "origin", "web result",
    "what is", "why does", "who is", "difference between", "how does", "explain",
    "benefits of", "drawbacks of", "pros and cons", "advantages and disadvantages",
    "search online", "google", "latest info", "find from web",
    "current events", "news", "internet", "real-time",
    "open web", "web search", "trending", "latest news",
    "latest trends", "latest updates", "recent developments"]

TASK_ASSIGNMENT_KEYWORDS = [
    "develop", "create", "build", "code", "script", "design", "plan","assign", "assignment", "who can do", "allocate", "assign task", 
    "skill match", "skill-based", "suitable person", 
    "best person", "appropriate person", "capable", 
    "match skills", "handle this task", "project requirement", 
    "project management", "agile", "who should work on",
    "assign", "assignment", "who can do", "allocate", "assign task", 
    "skill match", "skill-based", "suitable person", 
    "best person", "appropriate person", "capable", 
    "match skills", "handle this task", "project requirement", 
    "project management", "agile", "who should work on", 
    "who is best for", "expert in", "who should handle",
    "best person", "project management","agile","assign the task","building a new web application","web application","using JavaScript","JavaScript","task assignment","skill match","delegate","allocate","developer","technical task",
    "assign", "assignment", "delegate", "allocate", "building", "task","web application", "develop", "developer", "build", "javascript", "code",
    "assign the task","assign someone","assign a developer","assign a resource","assign to","who can handle","who should work on","who is best suited",
    "allocate task","delegate this task","task assignment","match skills","find the best person","choose a developer","select a person",
    "assign a team member","find a suitable candidate","build using","develop using",  # e.g., develop using Node.js
    "who has experience in","skill-based task","pick someone for","select resource","who is suitable for",
    "choose developer","allocate a developer","choose the right person","assign based on skills"
]

COMPLETION_ESTIMATION_KEYWORDS = [
    "estimate", "completion", "finish", "time", "deadline", "duration", "how long",
    "estimate its completion date","completion date","leave schedules","weekends","availability","working days",
    "timeline","project schedule","estimate", "completion", "deadline", "timeline", "duration",
    "leave schedules", "weekend", "working days", "availability","completion", "estimate", "timeline", "deadline", 
    "working days", "duration", "how long", "leave_estimate", "weekends", "availability","estimate completion",
    "completion time","how many days","how long","timeline","delivery timeline","when will it be completed",
    "expected completion","calculate completion","project duration","working days","task duration","task timeline",
    "schedule estimation","consider leave","leave schedule","account for weekends","delivery date","expected delivery",
    "estimate the duration","time to finish","task estimation","calculate due date","availability impact",
    "plan around leave","planned leave","deadline calculation"
]


def route_query(state: State) -> str:
    query = state.query.lower()
    if state.document_path or any(kw in query for kw in DOCUMENT_SEARCH_KEYWORDS):
        return "Documentation Search"
    if any(kw in query for kw in TASK_ASSIGNMENT_KEYWORDS):
        print(f"🔹 Routing to Task Assignment Agent")
        return "Assign Task"
    if any(kw in query for kw in COMPLETION_ESTIMATION_KEYWORDS):
        print(f"🔹 Routing to Completion Estimation Agent")
        return "Estimate Completion"
    if any(kw in query for kw in TASK_ASSIGNMENT_KEYWORDS + COMPLETION_ESTIMATION_KEYWORDS):
        return "Task Assignment"
    if any(kw in query for kw in HR_ASSISTANCE_KEYWORDS):
        return "HR Assistance"
    if any(kw in query for kw in IT_SUPPORT_KEYWORDS):
        return "IT Support"
    if any(kw in query for kw in WELLNESS_KEYWORDS):
        return "Wellness Assistance"
    if any(kw in query for kw in PRODUCTIVITY_KEYWORDS):
        return "Productivity Assistance"
    if any(kw in query for kw in RISK_KEYWORDS):
        return "Risk Assistance"
    if any(kw in query for kw in WEB_SEARCH_KEYWORDS):
        return "Web Search"
    return "Web Search"


def mainLogicStartsHere(userQuery:str):
    graph = lg.StateGraph(State)
    graph.add_node("Router", lambda state: state.model_dump())
    graph.add_node("IT Support", it_support)
    graph.add_node("HR Assistance", hr_assistance)
    graph.add_node("Web Search", web_search)
    graph.add_node("Documentation Search", documentation_search)
    graph.add_node("Wellness Assistance", wellness)
    graph.add_node("Productivity Assistance", productivity)
    graph.add_node("Risk Assistance", risk)
    graph.add_node("Assign Task", assign_task)
    graph.add_node("Estimate Completion", estimate_completion)

    graph.set_entry_point("Router")
    graph.add_conditional_edges("Router", route_query, {
        "IT Support": "IT Support",
        "HR Assistance": "HR Assistance",
        "Web Search": "Web Search",
        "Documentation Search": "Documentation Search",
        "Wellness Assistance": "Wellness Assistance",
        "Productivity Assistance": "Productivity Assistance",
        "Risk Assistance": "Risk Assistance",
        "Assign Task": "Assign Task",
        "Estimate Completion": "Estimate Completion",
        END: END
    })

    workflow = graph.compile()
    
    input_data = {
        "query": userQuery,
        # "document_path": "C:/Users/Welcome/Downloads/SIMULINK BLOCK.pdf"
    }

    result = workflow.invoke(State(**input_data))
    print("Agents.py res",result)
    final_output = {"query": result.get("query")}
    for key in ["risk", "it_response", "hr_response", "wellness", "productivity", "web_search_response", "doc_search_response", "assigned_to", "estimated_completion"]:
        if result.get(key):
            final_output["response"] = result[key]
            break
    print("########",final_output)
    print("type of",type(final_output))
    print("final_response",final_output["response"])
    return final_output


mainLogicStartsHere("How do I request a new laptop or hardware upgrade? ")