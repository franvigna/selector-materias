import React, { useMemo, useCallback, useEffect, useRef } from 'react';
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

const leerVariableCSS = (nombre: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();

interface GrafoPrecedenciaProps {
  materiasConEstado: MateriaConEstado[];
  onCambiarEstado: (codigo: string, nuevoEstado: EstadoMateria) => void;
  tema: string;
}

const GrafoPrecedencia: React.FC<GrafoPrecedenciaProps> = ({
  materiasConEstado,
  onCambiarEstado,
  tema
}) => {
  const clickTimeout = useRef<number | null>(null);
  const clickCount = useRef(0);

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
    const ySpacing = 150;

    periodosOrdenados.forEach((periodo, periodoIdx) => {
      materiasPorPeriodo[periodo].forEach((materia, materiaIdx) => {
        const x = periodoIdx * xSpacing;
        const y = materiaIdx * ySpacing;

        let nodeClass = 'react-flow-node-default';

        switch (materia.estado) {
          case 'cursada':
            nodeClass = 'react-flow-node-cursada';
            break;
          case 'en_curso':
            nodeClass = 'react-flow-node-en-curso';
            break;
          case 'disponible':
            nodeClass = 'react-flow-node-disponible';
            break;
          case 'bloqueada':
            nodeClass = 'react-flow-node-bloqueada';
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
            borderWidth: '3px',
            borderStyle: 'solid',
            borderRadius: '10px',
            padding: '12px',
            width: 175,
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

    const colorEdge = leerVariableCSS('--grafo-edge-color') || '#7e57c2';

    materiasConEstado.forEach(materia => {
      materia.correlativas.forEach(correlativaCodigo => {
        edges.push({
          id: `${correlativaCodigo}-${materia.codigo}`,
          source: correlativaCodigo,
          target: materia.codigo,
          type: 'straight',
          animated: false,
          style: {
            stroke: colorEdge,
            strokeWidth: 2,
            opacity: 0.6
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: colorEdge,
            width: 20,
            height: 20,
          },
        });
      });
    });

    return edges;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materiasConEstado, tema]);

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

  // Manejar click y doble click
  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    const estado = node.data.estado as EstadoMateria;
    
    // No hacer nada si está bloqueada
    if (estado === 'bloqueada') {
      return;
    }

    clickCount.current += 1;

    if (clickCount.current === 1) {
      // Esperar para ver si es un doble click
      clickTimeout.current = window.setTimeout(() => {
        // Es un click simple
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
        clickCount.current = 0;
      }, 200);
    } else if (clickCount.current === 2) {
      // Es un doble click
      if (clickTimeout.current !== null) {
        window.clearTimeout(clickTimeout.current);
      }
      
      let nuevoEstado: EstadoMateria;
      
      if (estado === 'disponible') {
        nuevoEstado = 'en_curso';
      } else if (estado === 'cursada') {
        nuevoEstado = 'en_curso';
      } else if (estado === 'en_curso') {
        nuevoEstado = 'disponible';
      } else {
        nuevoEstado = 'en_curso';
      }

      onCambiarEstado(node.data.codigo, nuevoEstado);
      clickCount.current = 0;
    }
  }, [onCambiarEstado]);

  const nodeColor = useCallback((node: Node) => {
    if (node.className?.includes('cursada')) return leerVariableCSS('--estado-cursada-border');
    if (node.className?.includes('en-curso')) return leerVariableCSS('--estado-en-curso-border');
    if (node.className?.includes('disponible')) return leerVariableCSS('--estado-disponible-border');
    if (node.className?.includes('bloqueada')) return leerVariableCSS('--estado-bloqueada-border');
    return '#999';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tema]);

  const colorFondoPuntos = useMemo(
    () => leerVariableCSS('--grafo-background-dots') || '#aaa',
    [tema]
  );

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
        <Background color={colorFondoPuntos} gap={16} />
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