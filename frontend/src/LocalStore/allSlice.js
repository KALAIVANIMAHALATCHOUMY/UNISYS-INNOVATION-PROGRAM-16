import {createSlice, createAsyncThunk} from "@reduxjs/toolkit"

const baseUrl = "http://127.0.0.1:5000";

const initialState = {
    createdAgentsList: [],
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
            return rejectWithValue({error:`catch Request Cannot be FullFilled !! ${err}`})
        }
    }
);

export const entripriseAgents = createSlice({
  name: 'entripriseAgents',
  initialState,
  reducers: {
    setCreateAgent: (state, action) => {
        state.createdAgentsList = [
            ...state.createdAgentsList,
            action.payload
        ]
        },
    },
  extraReducers : (builder) => 
    {
        builder
        .addCase(createLowCodeAgent.pending, (state) => {
            state.userSystemConversations = [
                ...state.userSystemConversations,
                {text: state.currentUserInput, isBot: false, audioURL: ""},  // it is the current user Message
                {text: "loading" , isBot: true, audioURL: ""}   // chat gpt Message
            ]
            state.currentUserInput = "";
        })
        .addCase(createLowCodeAgent.fulfilled, (state, action) => {
            console.log("Fullfilled", action.payload)
            state.userSystemConversations.pop();
                state.userSystemConversations = [
                    ...state.userSystemConversations,
                    {text: action.payload.message, isBot: true, audioURL: action.payload.audioURL}   // chat gpt Message,

                ]
        })
        .addCase(createLowCodeAgent.rejected, (state, action) => {
            console.log("rejected?", action.payload.error);
            state.userSystemConversations.pop();
            state.userSystemConversations = [
                ...state.userSystemConversations,
                {text: action.payload.error, isBot: true, audioURL: ''}   // chat gpt Message
            ]
        })
    }
})

// Action creators are generated for each case reducer function
export const { setCreateAgent } = entripriseAgents.actions

export default entripriseAgents.reducer