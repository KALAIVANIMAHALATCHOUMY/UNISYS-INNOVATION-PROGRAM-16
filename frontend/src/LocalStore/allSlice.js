import {createSlice, createAsyncThunk} from "@reduxjs/toolkit"

const baseUrl = "http://127.0.0.1:5000";

const initialState = {
    createdAgentsList: [{"name":"Dhan"}],
    currentUserInput: '',
    userSystemConversations: [
        {
            sender: 'bot', message: "Hello, I am your assistant. How can I help you today?"
        }
    ],
}

export const createLowCodeAgent = createAsyncThunk(
    "POST_createLowCodeAgent/createLowCodeAgent",
    async (input, {rejectWithValue}) =>
    {
        console.log("input",input)
        try{
            const options = {
                method: "POST", 
                headers: {
                "Content-Type": "application/json"
                },
                body: JSON.stringify(input),
              };
            
            const response = await fetch(`${baseUrl}/createAgent`, options).then((res)=> res.json()).then((data)=> {return data});

            console.log(response);
            return response;
        } 
        catch(err)
        {
            return rejectWithValue({error: `${err}`})
        }
    }
);

export const Conversation = createAsyncThunk(
    'POST_Conversation/Conversation',
    async (input, {rejectWithValue}) =>
    {
        console.log("input",input);
        try{
            const options = {
                method: "POST", 
                headers: {
                "Content-Type": "application/json"
                },
                body: JSON.stringify(input),
              };
            
            const response = await fetch(`${baseUrl}/conversation`, options).then((res)=> res.json()).then((data)=> {return data});

            console.log(response);
            return response;
        } 
        catch(err)
        {
            // return rejectWithValue({error:`${err}`})
            return rejectWithValue({error:`Failed to fetch the response from the server. Please check your connection or try again later.`})
        }
    }
);

export const entripriseAgents = createSlice({
  name: 'entripriseAgents',
  initialState,
  reducers: {
        setCreateAgent: (state, action) => {
            console.log("setCreateAgent", action.payload)
            state.createdAgentsList = [
                ...state.createdAgentsList,
                action.payload
            ]
        },
        setUserSystemConversations: (state, action) => {
            console.log("current User Input", action.payload)
            state.currentUserInput = action.payload;
        },
    },
  extraReducers : (builder) => 
    {
        builder
        .addCase(Conversation.pending, (state) => {
            state.userSystemConversations = [
                ...state.userSystemConversations,
                {message: state.currentUserInput, sender: 'user'},  // it is the current user Message
                {message: "loading" , sender: 'bot'}   // chat gpt Message
            ]
            state.currentUserInput = "";
        })
        .addCase(Conversation.fulfilled, (state, action) => {
            console.log("Fullfilled", action.payload)
            state.userSystemConversations.pop();
                state.userSystemConversations = [
                    ...state.userSystemConversations,
                    {message: action.payload, sender: 'bot'}   // chat gpt Message,

                ]
        })
        .addCase(Conversation.rejected, (state, action) => {
            console.log("rejected?", action.payload.error);
            state.userSystemConversations.pop();
            state.userSystemConversations = [
                ...state.userSystemConversations,
                {message: action.payload.error, sender: 'bot'}   // chat gpt Message
            ]
        })
    }
})

// Action creators are generated for each case reducer function
export const { setCreateAgent, setUserSystemConversations } = entripriseAgents.actions

export default entripriseAgents.reducer