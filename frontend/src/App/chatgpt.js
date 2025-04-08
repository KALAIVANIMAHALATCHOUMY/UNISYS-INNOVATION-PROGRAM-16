import React, { useCallback, useState, useMemo } from 'react';
import { useEffect } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Handle,
  Position,
  Panel
} from '@xyflow/react';
// import ReactFlow from '@xyflow/react';
// import { ReactFlow } from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { createLowCodeAgent } from '../LocalStore/allSlice';
import { useDispatch } from 'react-redux';

// ----- Custom Node Components -----

// 1. AppNameNode: For entering the application name.
const AppNameNode = ({ data }) => {
  const [appName, setAppName] = useState(data.value || '');
  const handleChange = (e) => {
    data.onAppNameChange(e.target.value);
    setAppName(e.target.value);
    // setAgentConfig({ ...agsentConfig, appName: appName });
  };

  return (
    <div style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5 }}>
      <label style={{ display: 'block', marginBottom: 4 }}>Application Name:</label>
      <input
        type="text"
        placeholder="Enter application name"
        value={appName}
        onChange={handleChange}
        style={{ width: '100%' }}
      />
      {/* Output handle to connect to next node */}
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </div>
  );
};

// 2. DescriptionNode: For entering a description.
const DescriptionNode = ({ data }) => {
  const [description, setDescription] = useState(data.value || '');
  const handleChange = (e) => {
    setDescription(e.target.value);
    // setAgentConfig({ ...agentConfig, description: description });
    data.onDesChange(e.target.value);
  };

  return (
    <div style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5 }}>
      {/* Input handle from previous node */}
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      <label style={{ display: 'block', marginBottom: 4 }}>Application Description:</label>
      <textarea
        placeholder="Enter description"
        // value={data.value}
        value={description}
        onChange={handleChange}
        style={{ width: '100%', resize: 'none' }}
      />
      {/* Output handle to connect to next node */}
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </div>
  );
};

// 3. ModelSelectionNode: For selecting model name, version, and entering API key.
const ModelSelectionNode = ({ data }) => {
  const [model, setModel] = useState(data.model || '');
  const [version, setVersion] = useState(data.version || '');
  const [apiKey, setApiKey] = useState(data.apiKey || '');

  const handleModelChange = (e) => {
    setModel(e.target.value);
    // setAgentConfig({ ...agentConfig, model: model });
    data.onModelChange(e.target.value);
  };

  const handleVersionChange = (e) => {
    setVersion(e.target.value);
    // setAgentConfig({ ...agentConfig, version: version });
    data.onVersionChange(e.target.value);
  };

  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
    // setAgentConfig({ ...agentConfig, apiKey: apiKey });
    data.onApiKeyChange(e.target.value);
  };

  return (
    <div style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5 }}>
      {/* Input handle from previous node */}
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Model Name:</label>
        <select value={model} onChange={handleModelChange} style={{ width: '100%' }}>
          <option value="">Select Model</option>
          <option value="model1">Grok</option>
          <option value="model2">Llama 2</option>
          <option value="model3">Gemini</option>
        </select>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Version:</label>
        <select value={version} onChange={handleVersionChange} style={{ width: '100%' }}>
          <option value="">Select Version</option>
          <option value="v1">v1</option>
          <option value="v2">v2</option>
          <option value="v3">v3</option>
        </select>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>API Key:</label>
        <input
          type="password"
          placeholder="Enter API Key"
          value={apiKey}
          onChange={handleApiKeyChange}
          style={{ width: '100%' }}
        />
      </div>
      {/* Output handle to connect to next node */}
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </div>
  );
};

// 4. SubmitNode: Contains a system prompt textarea and a submit button.
const SubmitNode = ({ data }) => {
  const [sysPrompt, setPrompt] = useState(data.prompt || '');
  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
    data.onPromptChange(e.target.value);
  };


  return (
    <div style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5 }}>
      {/* Input handle from previous node */}
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      <label style={{ display: 'block', marginBottom: 4 }}>System Prompt:</label>
      <textarea
        placeholder="Enter system prompt"
        value={sysPrompt}
        onChange={handlePromptChange}
        style={{ width: '100%', marginBottom: 8 }}
      />
      <button onClick={data.onSubmit} style={{ width: '100%', padding: '6px 0' }}>
        Create Agent
      </button>
    </div>
  );
};


// ----- Main Flow Component -----
export default function Flow() {
  const dispatch = useDispatch();
  const [agentConfig, setAgentConfig] = useState({
    'applicationName': '',
    'description': '',
    'modelName': '',
    'version': '',
    'apiKey': '',
    'prompt': ''
  });

  const updateField = (field, value) => {
    console.log("field", field, "value", value);
    setAgentConfig((prev) => ({ ...prev, [field]: value }));
    console.log("agentConfig updates", agentConfig, "sa", [field], value);
  };
  
  useEffect(() => {
    console.log("Updated agentConfig:", agentConfig);
    console.log("Updated agentConfig:", agentConfig['applicationName']);
  }, [agentConfig]);

  // ----- Registering the Node Types -----
const nodeTypes = {
  appName: AppNameNode,
  description: DescriptionNode,
  modelSelection: ModelSelectionNode,
  submitNode: SubmitNode
};

// ----- Initial Nodes and Edges -----
// For demonstration, the nodes are arranged in a horizontal sequence.
const initialNodes =  [
  {
    id: 'node-1',
    type: 'appName',
    position: { x: 50, y: 100 },
    data: {
      value: agentConfig.applicationName,
      onAppNameChange: (val) => updateField('applicationName', val)
    },
    style: { backgroundColor: '#ff0072', color: 'white' },
  },
  {
    id: 'node-2',
    type: 'description',
    position: { x: 300, y: 100 },
    data: {
      value: agentConfig.description,
      onDesChange: (val) => updateField('description', val)
    },
    style: { backgroundColor: '#6865A5', color: 'white' }
  },
  {
    id: 'node-3',
    type: 'modelSelection',
    position: { x: 550, y: 100 },
    data: {
      model: agentConfig.modelName,
      version: agentConfig.version,
      apiKey: agentConfig.apiKey,
      onModelChange: (val) => updateField('modelName', val),
      onVersionChange: (val) => updateField('version', val),
      onApiKeyChange: (val) => updateField('apiKey', val)
    },
    style: { backgroundColor: '#ff0072', color: 'white' },
  },
  {
    id: 'node-4',
    type: 'submitNode',
    position: { x: 800, y: 100 },
    data: {
      prompt: agentConfig.prompt,
      onPromptChange: (val) => updateField('prompt', val),
      onSubmit: () => {
        console.log("agentConfig res", agentConfig);
        // Destructure all necessary fields from agentConfig
        const { applicationName, description, modelName, version, apiKey, prompt } = agentConfig;
        console.log("111",agentConfig.applicationName , description, modelName, version, apiKey, prompt);
        console.log(agentConfig['applicationName']);
      // Check if any field is empty
      if (!applicationName || !description || !modelName || !version || !apiKey || !prompt) {
        alert('Please fill out all fields before submitting.', agentConfig['applicationName']);
        return;
      }
      else {
        dispatch(createLowCodeAgent(agentConfig));
      }

      // All fields are filled – proceed with submission
      console.log('Agent Config Submitted:', agentConfig);
      // You can add further processing here
      }
    },
    style: { backgroundColor: '#6865A5', color: 'white' }
  }
];

const initialEdges = [
  { id: 'edge-1', source: 'node-1', target: 'node-2', animated: true, 
    // label: 'to the', 
    // type: 'step'
    },
  { id: 'edge-2', source: 'node-2', target: 'node-3', animated: true  },
  { id: 'edge-3', source: 'node-3', target: 'node-4', animated: true  }
];


  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [variant, setVariant] = useState('cross');

  // Handlers for node and edge changes (for interactive flows)
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  const styles = {
    // background: 'grey',
    width: '100%',
    // height: 300,
  };

  return (
    <div style={{ height: '100vh' }}>
      <ReactFlow
       style={styles}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#ccc" variant={variant} />
      <Panel>
      <div style={{ paddingBottom: '10px'}}>Background variant:</div>
        <button onClick={() => setVariant('dots')}>dots</button>
        <button onClick={() => setVariant('lines')}>lines</button>
        <button onClick={() => setVariant('cross')}>cross</button>
      </Panel>
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Controls />
      </ReactFlow>
    </div>
  );
}

// export default Flow;
