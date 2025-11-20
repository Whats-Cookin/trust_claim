import { describe, it, expect } from 'vitest'
import { parseSingleNode, parseMultipleNodes } from './graph.utils'

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
})
