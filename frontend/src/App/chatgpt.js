import React, { useCallback, useState, useMemo, useEffect } from 'react';
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
import '@xyflow/react/dist/style.css';
import { createLowCodeAgent } from '../LocalStore/allSlice';
import { useDispatch } from 'react-redux';
import { setCreateAgent } from '../LocalStore/allSlice';

// ----- Custom Node Components -----
const AppNameNode = ({ data }) => {
  const [appName, setAppName] = useState(data.value || '');
  const handleChange = (e) => {
    setAppName(e.target.value);
    data.onAppNameChange(e.target.value);
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
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </div>
  );
};

const DescriptionNode = ({ data }) => {
  const [description, setDescription] = useState(data.value || '');
  const handleChange = (e) => {
    setDescription(e.target.value);
    data.onDesChange(e.target.value);
  };

  return (
    <div style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5 }}>
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      <label style={{ display: 'block', marginBottom: 4 }}>Application Description:</label>
      <textarea
        placeholder="Enter description"
        value={description}
        onChange={handleChange}
        style={{ width: '100%', resize: 'none' }}
      />
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </div>
  );
};

const ModelSelectionNode = ({ data }) => {
  const [model, setModel] = useState(data.model || '');
  const [version, setVersion] = useState(data.version || '');
  const [apiKey, setApiKey] = useState(data.apiKey || '');

  return (
    <div style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5 }}>
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Model Name:</label>
        <select
          value={model}
          onChange={(e) => {
            setModel(e.target.value);
            data.onModelChange(e.target.value);
          }}
          style={{ width: '100%' }}
        >
          <option value="">Select Model</option>
          <option value="Grok">Grok</option>
          <option value="Llama 2">Llama 2</option>
          <option value="Gemini">Gemini</option>
        </select>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Version:</label>
        <select
          value={version}
          onChange={(e) => {
            setVersion(e.target.value);
            data.onVersionChange(e.target.value);
          }}
          style={{ width: '100%' }}
        >
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
          onChange={(e) => {
            setApiKey(e.target.value);
            data.onApiKeyChange(e.target.value);
          }}
          style={{ width: '100%' }}
        />
      </div>
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </div>
  );
};

const SubmitNode = ({ data }) => {
  const [sysPrompt, setPrompt] = useState(data.prompt || '');
  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
    data.onPromptChange(e.target.value);
  };

  return (
    <div style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5 }}>
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

export default function Flow() {
  const dispatch = useDispatch();
  const [agentConfig, setAgentConfig] = useState({
    applicationName: '',
    description: '',
    modelName: '',
    version: '',
    apiKey: '',
    prompt: ''
  });

  const updateField = (field, value) => {
    setAgentConfig((prev) => ({ ...prev, [field]: value }));
  };

  const nodeTypes = useMemo(() => ({
    appName: AppNameNode,
    description: DescriptionNode,
    modelSelection: ModelSelectionNode,
    submitNode: SubmitNode
  }), []);

  const nodes = [
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
      style: { backgroundColor: '#6865A5', color: 'white' },
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
          const { applicationName, description, modelName, version, apiKey, prompt } = agentConfig;
          if (!applicationName || !description || !modelName || !version || !apiKey || !prompt) {
            alert('Please fill out all fields before submitting.');
            return;
          }
          dispatch(setCreateAgent(agentConfig));
          console.log('Agent Config Submitted:', agentConfig);
        }
      },
      style: { backgroundColor: '#6865A5', color: 'white' },
    }
  ];

  const edges = [
    { id: 'edge-1', source: 'node-1', target: 'node-2', animated: true },
    { id: 'edge-2', source: 'node-2', target: 'node-3', animated: true },
    { id: 'edge-3', source: 'node-3', target: 'node-4', animated: true }
  ];

  const [edgeState, setEdges] = useState(edges);
  const [variant, setVariant] = useState('cross');

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  return (
    <div style={{ height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edgeState}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#ccc" variant={variant} />
        <Panel>
          <div style={{ paddingBottom: '10px' }}>Background variant:</div>
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
