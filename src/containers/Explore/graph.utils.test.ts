import { describe, it, expect } from 'vitest'
import { parseSingleNode, parseMultipleNodes, parseClaims, mergeSameAsNodes } from './graph.utils'

describe('graph.utils deduplication', () => {
  describe('parseSingleNode', () => {
    it('should not add duplicate nodes when called multiple times', () => {
      const nodes: any[] = []
      const edges: any[] = []
      const existingNodeIds = new Set<string>()
      const existingEdgeIds = new Set<string>()

      const testNode = {
        id: 123,
        name: 'Test Node',
        nodeUri: 'https://example.com/node/123',
        displayName: 'Test Display Name',
        edgesFrom: [],
        edgesTo: []
      }

      // First call should add the node
      parseSingleNode(nodes, edges, testNode, existingNodeIds, existingEdgeIds)
      expect(nodes).toHaveLength(1)
      expect(nodes[0].data.id).toBe('123')

      // Second call with same node should not add duplicate
      parseSingleNode(nodes, edges, testNode, existingNodeIds, existingEdgeIds)
      expect(nodes).toHaveLength(1)
    })

    it('should not add duplicate edges when called multiple times', () => {
      const nodes: any[] = []
      const edges: any[] = []
      const existingNodeIds = new Set<string>()
      const existingEdgeIds = new Set<string>()

      const testNode = {
        id: 1,
        name: 'Node 1',
        nodeUri: 'https://example.com/node/1',
        displayName: 'Node 1',
        edgesFrom: [
          {
            id: 100,
            startNodeId: 1,
            endNodeId: 2,
            label: 'is_vouched_for',
            endNode: {
              id: 2,
              name: 'Node 2',
              nodeUri: 'https://example.com/node/2',
              displayName: 'Node 2'
            }
          }
        ],
        edgesTo: []
      }

      // First call should add the edge
      parseSingleNode(nodes, edges, testNode, existingNodeIds, existingEdgeIds)
      expect(edges).toHaveLength(1)
      expect(edges[0].data.id).toBe('100')

      // Second call should not add duplicate edge
      parseSingleNode(nodes, edges, testNode, existingNodeIds, existingEdgeIds)
      expect(edges).toHaveLength(1)
    })

    it('should handle nodes with both edgesFrom and edgesTo without duplicating edges', () => {
      const nodes: any[] = []
      const edges: any[] = []
      const existingNodeIds = new Set<string>()
      const existingEdgeIds = new Set<string>()

      const testNode = {
        id: 1,
        name: 'Central Node',
        nodeUri: 'https://example.com/node/1',
        displayName: 'Central Node',
        edgesFrom: [
          {
            id: 100,
            startNodeId: 1,
            endNodeId: 2,
            label: 'rated',
            endNode: {
              id: 2,
              name: 'Node 2',
              nodeUri: 'https://example.com/node/2',
              displayName: 'Node 2'
            }
          }
        ],
        edgesTo: [
          {
            id: 101,
            startNodeId: 3,
            endNodeId: 1,
            label: 'validated',
            startNode: {
              id: 3,
              name: 'Node 3',
              nodeUri: 'https://example.com/node/3',
              displayName: 'Node 3'
            }
          }
        ]
      }

      parseSingleNode(nodes, edges, testNode, existingNodeIds, existingEdgeIds)

      // Should have 3 nodes: central + from + to
      expect(nodes).toHaveLength(3)
      // Should have 2 unique edges
      expect(edges).toHaveLength(2)

      // Verify edge IDs are unique
      const edgeIds = edges.map(e => e.data.id)
      expect(new Set(edgeIds).size).toBe(2)
    })

    it('should add connected nodes from edges', () => {
      const nodes: any[] = []
      const edges: any[] = []
      const existingNodeIds = new Set<string>()
      const existingEdgeIds = new Set<string>()

      const testNode = {
        id: 1,
        name: 'Node 1',
        nodeUri: 'https://example.com/node/1',
        displayName: 'Node 1',
        edgesFrom: [
          {
            id: 100,
            startNodeId: 1,
            endNodeId: 2,
            label: 'is_vouched_for',
            endNode: {
              id: 2,
              name: 'Node 2',
              nodeUri: 'https://example.com/node/2',
              displayName: 'Node 2'
            }
          }
        ],
        edgesTo: []
      }

      parseSingleNode(nodes, edges, testNode, existingNodeIds, existingEdgeIds)

      expect(nodes).toHaveLength(2)
      expect(nodes.find((n: any) => n.data.id === '1')).toBeDefined()
      expect(nodes.find((n: any) => n.data.id === '2')).toBeDefined()
    })
  })

  describe('parseMultipleNodes', () => {
    it('should deduplicate nodes across multiple nodes in array', () => {
      const testData = [
        {
          id: 1,
          name: 'Node 1',
          nodeUri: 'https://example.com/node/1',
          displayName: 'Node 1',
          edgesFrom: [
            {
              id: 100,
              startNodeId: 1,
              endNodeId: 2,
              label: 'rated',
              endNode: {
                id: 2,
                name: 'Node 2',
                nodeUri: 'https://example.com/node/2',
                displayName: 'Node 2'
              }
            }
          ],
          edgesTo: []
        },
        {
          id: 2,
          name: 'Node 2',
          nodeUri: 'https://example.com/node/2',
          displayName: 'Node 2',
          edgesFrom: [],
          edgesTo: [
            {
              id: 100,
              startNodeId: 1,
              endNodeId: 2,
              label: 'rated',
              startNode: {
                id: 1,
                name: 'Node 1',
                nodeUri: 'https://example.com/node/1',
                displayName: 'Node 1'
              }
            }
          ]
        }
      ]

      const result = parseMultipleNodes(testData)

      // Should only have 2 unique nodes despite both appearing in multiple places
      expect(result.nodes).toHaveLength(2)

      // Should only have 1 unique edge (edge 100 appears in both nodes)
      expect(result.edges).toHaveLength(1)
      expect(result.edges[0].data.id).toBe('100')
    })

    it('should handle single node object', () => {
      const testData = {
        id: 1,
        name: 'Node 1',
        nodeUri: 'https://example.com/node/1',
        displayName: 'Node 1',
        edgesFrom: [],
        edgesTo: []
      }

      const result = parseMultipleNodes(testData)

      expect(result.nodes).toHaveLength(1)
      expect(result.nodes[0].data.id).toBe('1')
    })

    it('should handle empty array', () => {
      const result = parseMultipleNodes([])

      expect(result.nodes).toHaveLength(0)
      expect(result.edges).toHaveLength(0)
    })

    it('should preserve edge styles based on claim type', () => {
      const testData = {
        id: 1,
        name: 'Node 1',
        nodeUri: 'https://example.com/node/1',
        displayName: 'Node 1',
        edgesFrom: [
          {
            id: 100,
            startNodeId: 1,
            endNodeId: 2,
            label: 'is_vouched_for',
            endNode: {
              id: 2,
              name: 'Node 2',
              nodeUri: 'https://example.com/node/2',
              displayName: 'Node 2'
            }
          }
        ],
        edgesTo: []
      }

      const result = parseMultipleNodes(testData)

      expect(result.edges).toHaveLength(1)
      expect(result.edges[0].data.relation).toBe('is_vouched_for')
      expect(result.edges[0].data.color).toBeDefined()
      expect(result.edges[0].data.width).toBeDefined()
      expect(result.edges[0].data.arrow).toBeDefined()
    })
  })

  describe('node data handling', () => {
    it('should handle nodes with missing displayName', () => {
      const nodes: any[] = []
      const edges: any[] = []
      const existingNodeIds = new Set<string>()
      const existingEdgeIds = new Set<string>()

      const testNode = {
        id: 1,
        name: 'Node 1',
        nodeUri: 'https://example.com/node/1',
        // No displayName
        edgesFrom: [],
        edgesTo: []
      }

      parseSingleNode(nodes, edges, testNode, existingNodeIds, existingEdgeIds)

      expect(nodes).toHaveLength(1)
      expect(nodes[0].data.label).toBe('Node 1') // Should fall back to name
    })

    it('should include entity type information', () => {
      const nodes: any[] = []
      const edges: any[] = []
      const existingNodeIds = new Set<string>()
      const existingEdgeIds = new Set<string>()

      const testNode = {
        id: 1,
        name: 'Test Claim',
        nodeUri: 'https://example.com/claim/1',
        displayName: 'Test Claim',
        entType: 'CLAIM',
        edgesFrom: [],
        edgesTo: []
      }

      parseSingleNode(nodes, edges, testNode, existingNodeIds, existingEdgeIds)

      expect(nodes).toHaveLength(1)
      expect(nodes[0].data.entType).toBe('CLAIM')
      expect(nodes[0].data.entityType).toBe('CLAIM')
    })
  })

  describe('two-level deduplication strategy', () => {
    it('demonstrates why front-end deduplication is necessary', () => {
      // This test documents the two-level deduplication approach:
      // Level 1: parseSingleNode deduplicates within an API response by database ID
      // Level 2: Explore component must also dedupe against the Cytoscape graph by database ID
      //
      // Why? The API doesn't know what nodes/edges are already displayed in the graph.
      // When expanding a node, we might get nodes that are already rendered.

      // Simulate first API call
      const firstCallNodes: any[] = []
      const firstCallEdges: any[] = []
      const firstCallNodeIds = new Set<string>()
      const firstCallEdgeIds = new Set<string>()

      const node1 = {
        id: 1,
        name: 'Node 1',
        nodeUri: 'https://example.com/node/1',
        displayName: 'Node 1',
        edgesFrom: [
          {
            id: 100,
            startNodeId: 1,
            endNodeId: 2,
            label: 'rated',
            endNode: {
              id: 2,
              name: 'Node 2',
              nodeUri: 'https://example.com/node/2',
              displayName: 'Node 2'
            }
          }
        ],
        edgesTo: []
      }

      parseSingleNode(firstCallNodes, firstCallEdges, node1, firstCallNodeIds, firstCallEdgeIds)

      // First call gives us 2 nodes (1 and 2) and 1 edge
      expect(firstCallNodes).toHaveLength(2)
      expect(firstCallEdges).toHaveLength(1)

      // Simulate second API call expanding Node 2
      // This will return Node 2 again with its connections, including back to Node 1
      const secondCallNodes: any[] = []
      const secondCallEdges: any[] = []
      const secondCallNodeIds = new Set<string>()
      const secondCallEdgeIds = new Set<string>()

      const node2 = {
        id: 2,
        name: 'Node 2',
        nodeUri: 'https://example.com/node/2',
        displayName: 'Node 2',
        edgesFrom: [],
        edgesTo: [
          {
            id: 100, // Same edge as before!
            startNodeId: 1,
            endNodeId: 2,
            label: 'rated',
            startNode: {
              id: 1, // Node 1 is already in the graph!
              name: 'Node 1',
              nodeUri: 'https://example.com/node/1',
              displayName: 'Node 1'
            }
          }
        ]
      }

      parseSingleNode(secondCallNodes, secondCallEdges, node2, secondCallNodeIds, secondCallEdgeIds)

      // Second call returns 2 nodes (1 and 2) and 1 edge
      expect(secondCallNodes).toHaveLength(2)
      expect(secondCallEdges).toHaveLength(1)

      // PROBLEM: Without front-end deduplication, we would try to add nodes 1 and 2 again!
      // The Explore component must filter these against cy.nodes() and cy.edges()
      //
      // Solution in Explore/index.tsx:fetchRelatedClaims():
      // const currentGraphNodeIds = new Set(cy.nodes().map((n: any) => n.id()))
      // const actuallyNewNodes = newNodes.filter((node: any) => !currentGraphNodeIds.has(node.data.id))
      // const currentGraphEdgeIds = new Set(cy.edges().map((e: any) => e.id()))
      // const actuallyNewEdges = newEdges.filter((edge: any) => !currentGraphEdgeIds.has(edge.data.id))

      // Simulate what the front-end should do:
      const graphNodeIds = new Set(firstCallNodes.map((n: any) => n.data.id))
      const graphEdgeIds = new Set(firstCallEdges.map((e: any) => e.data.id))

      const actuallyNewNodes = secondCallNodes.filter((n: any) => !graphNodeIds.has(n.data.id))
      const actuallyNewEdges = secondCallEdges.filter((e: any) => !graphEdgeIds.has(e.data.id))

      // After filtering, we should have no new nodes or edges to add
      expect(actuallyNewNodes).toHaveLength(0)
      expect(actuallyNewEdges).toHaveLength(0)
    })
  })

  describe('mergeSameAsNodes', () => {
    it('should merge two nodes connected by SAME_AS edge', () => {
      const nodes = [
        { data: { id: '1', label: 'Alice', uri: 'https://example.com/alice' } },
        { data: { id: '2', label: 'Alice Smith', uri: 'https://other.com/alice' } }
      ]
      const edges = [{ data: { id: '100', source: '1', target: '2', relation: 'same_as' } }]

      const result = mergeSameAsNodes(nodes, edges, true)

      expect(result.nodes).toHaveLength(1)
      expect(result.nodes[0].data.id).toBe('1') // Lower ID is canonical
      expect(result.nodes[0].data.isMerged).toBe(true)
      expect(result.nodes[0].data.aliases).toHaveLength(2)
      expect(result.edges).toHaveLength(0) // SAME_AS edge removed
    })

    it('should handle transitive SAME_AS relationships (A-B-C)', () => {
      const nodes = [
        { data: { id: '1', label: 'A' } },
        { data: { id: '2', label: 'B' } },
        { data: { id: '3', label: 'C' } }
      ]
      const edges = [
        { data: { id: '100', source: '1', target: '2', relation: 'same_as' } },
        { data: { id: '101', source: '2', target: '3', relation: 'same_as' } }
      ]

      const result = mergeSameAsNodes(nodes, edges, true)

      expect(result.nodes).toHaveLength(1)
      expect(result.nodes[0].data.aliases).toHaveLength(3)
      expect(result.edges).toHaveLength(0)
    })

    it('should prefer shorter, non-URL labels', () => {
      const nodes = [
        { data: { id: '1', label: 'https://example.com/person/12345' } },
        { data: { id: '2', label: 'Alice' } }
      ]
      const edges = [{ data: { id: '100', source: '1', target: '2', relation: 'same_as' } }]

      const result = mergeSameAsNodes(nodes, edges, true)

      expect(result.nodes[0].data.label).toBe('Alice')
    })

    it('should rewrite edges to point to canonical nodes', () => {
      const nodes = [
        { data: { id: '1', label: 'A' } },
        { data: { id: '2', label: 'B' } },
        { data: { id: '3', label: 'C' } }
      ]
      const edges = [
        { data: { id: '100', source: '1', target: '2', relation: 'same_as' } },
        { data: { id: '101', source: '3', target: '2', relation: 'rated' } } // Points to merged node
      ]

      const result = mergeSameAsNodes(nodes, edges, true)

      expect(result.edges).toHaveLength(1)
      expect(result.edges[0].data.source).toBe('3')
      expect(result.edges[0].data.target).toBe('1') // Rewritten to canonical
      expect(result.edges[0].data.originalTarget).toBe('2')
    })

    it('should remove self-loops created by merging', () => {
      const nodes = [{ data: { id: '1', label: 'A' } }, { data: { id: '2', label: 'B' } }]
      const edges = [
        { data: { id: '100', source: '1', target: '2', relation: 'same_as' } },
        { data: { id: '101', source: '1', target: '2', relation: 'rated' } } // Would become self-loop
      ]

      const result = mergeSameAsNodes(nodes, edges, true)

      expect(result.edges).toHaveLength(0) // Both edges removed (SAME_AS + self-loop)
    })

    it('should deduplicate edges that become identical after merge', () => {
      const nodes = [
        { data: { id: '1', label: 'A' } },
        { data: { id: '2', label: 'B' } },
        { data: { id: '3', label: 'C' } }
      ]
      const edges = [
        { data: { id: '100', source: '1', target: '2', relation: 'same_as' } },
        { data: { id: '101', source: '3', target: '1', relation: 'rated' } },
        { data: { id: '102', source: '3', target: '2', relation: 'rated' } } // Duplicate after merge
      ]

      const result = mergeSameAsNodes(nodes, edges, true)

      expect(result.edges).toHaveLength(1)
      expect(result.edges[0].data.relation).toBe('rated')
    })

    it('should passthrough when no SAME_AS edges exist', () => {
      const nodes = [{ data: { id: '1', label: 'A' } }]
      const edges = [{ data: { id: '100', source: '1', target: '2', relation: 'rated' } }]

      const result = mergeSameAsNodes(nodes, edges, true)

      expect(result.nodes).toBe(nodes)
      expect(result.edges).toBe(edges)
    })

    it('should passthrough when disabled', () => {
      const nodes = [{ data: { id: '1', label: 'A' } }]
      const edges = [{ data: { id: '100', source: '1', target: '2', relation: 'same_as' } }]

      const result = mergeSameAsNodes(nodes, edges, false)

      expect(result.nodes).toBe(nodes)
      expect(result.edges).toBe(edges)
    })

    it('should handle multiple disconnected SAME_AS groups', () => {
      const nodes = [
        { data: { id: '1', label: 'A1' } },
        { data: { id: '2', label: 'A2' } },
        { data: { id: '3', label: 'B1' } },
        { data: { id: '4', label: 'B2' } }
      ]
      const edges = [
        { data: { id: '100', source: '1', target: '2', relation: 'same_as' } },
        { data: { id: '101', source: '3', target: '4', relation: 'same_as' } }
      ]

      const result = mergeSameAsNodes(nodes, edges, true)

      expect(result.nodes).toHaveLength(2)
      expect(result.nodes[0].data.aliases).toHaveLength(2)
      expect(result.nodes[1].data.aliases).toHaveLength(2)
    })
  })

  describe('parseClaims', () => {
    it('should parse basic claim with subject and object', () => {
      const claims = [
        {
          id: 1,
          subject: 'https://example.com/alice',
          claim: 'knows',
          object: 'https://example.com/bob'
        }
      ]

      const elements = parseClaims(claims)

      expect(elements).toHaveLength(3) // 2 nodes + 1 edge
      const nodes = elements.filter((e: any) => !e.data.source)
      const edges = elements.filter((e: any) => e.data.source)
      expect(nodes).toHaveLength(2)
      expect(edges).toHaveLength(1)
      expect(edges[0].data.relation).toBe('knows')
    })

    it('should handle claims with missing subject or object', () => {
      const claims = [
        { id: 1, subject: 'https://example.com/alice', claim: 'exists' },
        { id: 2, object: 'https://example.com/bob', claim: 'exists' }
      ]

      const elements = parseClaims(claims)

      expect(elements).toHaveLength(2) // Only 2 nodes, no edges
    })

    it('should handle non-URL subjects and objects', () => {
      const claims = [{ id: 1, subject: 'Alice', claim: 'knows', object: 'Bob' }]

      const elements = parseClaims(claims)

      expect(elements).toHaveLength(3)
      const nodes = elements.filter((e: any) => !e.data.source)
      expect(nodes[0].data.label).toBe('Alice')
      expect(nodes[1].data.label).toBe('Bob')
    })
  })
})
