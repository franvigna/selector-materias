import React, { useMemo, useCallback, useEffect } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  type NodeMouseHandler,
  type NodeDragHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { MateriaConEstado, EstadoMateria } from '../types/materia';
import '../styles/GrafoPrecedencia.css';

interface GrafoPrecedenciaProps {
  materiasConEstado: MateriaConEstado[];
  onCambiarEstado: (codigo: string, nuevoEstado: EstadoMateria) => void;
}

const GrafoPrecedencia: React.FC<GrafoPrecedenciaProps> = ({ 
  materiasConEstado,
  onCambiarEstado
}) => {
  // Agrupar materias por período
  const materiasPorPeriodo = useMemo(() => {
    const grupos: { [key: string]: MateriaConEstado[] } = {};
    
    materiasConEstado.forEach(materia => {
      if (!grupos[materia.periodo]) {
        grupos[materia.periodo] = [];
      }
      grupos[materia.periodo].push(materia);
    });
    
    return grupos;
  }, [materiasConEstado]);

  // Ordenar períodos
  const periodosOrdenados = useMemo(() => {
    return Object.keys(materiasPorPeriodo).sort((a, b) => {
      if (a === 'TRANSVERSAL') return 1;
      if (b === 'TRANSVERSAL') return -1;
      
      const anioA = parseInt(a.charAt(2));
      const anioB = parseInt(b.charAt(2));
      const cuatrimestreA = parseInt(a.charAt(0));
      const cuatrimestreB = parseInt(b.charAt(0));
      
      if (anioA !== anioB) {
        return anioA - anioB;
      }
      return cuatrimestreA - cuatrimestreB;
    });
  }, [materiasPorPeriodo]);

  // Crear nodos para ReactFlow
  const createNodes = useCallback(() => {
    const nodes: Node[] = [];
    const xSpacing = 300;
    const ySpacing = 120;

    periodosOrdenados.forEach((periodo, periodoIdx) => {
      materiasPorPeriodo[periodo].forEach((materia, materiaIdx) => {
        const x = periodoIdx * xSpacing;
        const y = materiaIdx * ySpacing;

        let nodeClass = 'react-flow-node-default';
        let borderColor = '#999';

        switch (materia.estado) {
          case 'cursada':
            nodeClass = 'react-flow-node-cursada';
            borderColor = '#81c784';
            break;
          case 'en_curso':
            nodeClass = 'react-flow-node-en-curso';
            borderColor = '#64b5f6';
            break;
          case 'disponible':
            nodeClass = 'react-flow-node-disponible';
            borderColor = '#ffd54f';
            break;
          case 'bloqueada':
            nodeClass = 'react-flow-node-bloqueada';
            borderColor = '#e57373';
            break;
        }

        nodes.push({
          id: materia.codigo,
          type: 'default',
          position: { x, y },
          data: { 
            label: (
              <div className="nodo-contenido">
                <div className="nodo-nombre">{materia.nombre}</div>
              </div>
            ),
            estado: materia.estado,
            codigo: materia.codigo,
            xOriginal: x
          },
          className: nodeClass,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          style: {
            border: `3px solid ${borderColor}`,
            borderRadius: '10px',
            padding: '12px',
            width: 150,
            fontSize: '12px',
            cursor: materia.estado !== 'bloqueada' ? 'pointer' : 'not-allowed',
          }
        });
      });
    });

    return nodes;
  }, [periodosOrdenados, materiasPorPeriodo, materiasConEstado]);

  // Crear edges (conexiones) para ReactFlow
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];

    materiasConEstado.forEach(materia => {
      materia.correlativas.forEach(correlativaCodigo => {
        edges.push({
          id: `${correlativaCodigo}-${materia.codigo}`,
          source: correlativaCodigo,
          target: materia.codigo,
          type: 'straight',
          animated: false,
          style: { 
            stroke: '#7e57c2', 
            strokeWidth: 2,
            opacity: 0.6
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#7e57c2',
            width: 20,
            height: 20,
          },
        });
      });
    });

    return edges;
  }, [materiasConEstado]);

  const [nodes, setNodes, onNodesChange] = useNodesState(createNodes());
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(createNodes());
  }, [materiasConEstado, createNodes, setNodes]);

  const onNodeDrag: NodeDragHandler = useCallback((_event, node) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === node.id) {
          return {
            ...n,
            position: {
              x: n.data.xOriginal,
              y: node.position.y,
            },
          };
        }
        return n;
      })
    );
  }, [setNodes]);

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    const estado = node.data.estado as EstadoMateria;
    
    if (estado === 'bloqueada') {
      return;
    }

    let nuevoEstado: EstadoMateria;
    
    if (estado === 'disponible') {
      nuevoEstado = 'cursada';
    } else if (estado === 'cursada') {
      nuevoEstado = 'disponible';
    } else if (estado === 'en_curso') {
      nuevoEstado = 'cursada';
    } else {
      nuevoEstado = 'disponible';
    }

    onCambiarEstado(node.data.codigo, nuevoEstado);
  }, [onCambiarEstado]);

  const nodeColor = (node: Node) => {
    if (node.className?.includes('cursada')) return '#81c784';
    if (node.className?.includes('en-curso')) return '#64b5f6';
    if (node.className?.includes('disponible')) return '#ffd54f';
    if (node.className?.includes('bloqueada')) return '#e57373';
    return '#999';
  };

  return (
    <div className="grafo-container-solo">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDrag={onNodeDrag}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor={nodeColor}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  );
};

export default GrafoPrecedencia;