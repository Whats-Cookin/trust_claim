import json

with open('sample.json', 'r') as f:
  data = json.load(f)

import pdb; pdb.set_trace()

# we are only interested in nodes that are type claim
# iterate thru all the nodes to see which are type claim
claim1 = data['nodes'][4]
subject = claim1['edgesTo'][0]['claim']['subject']
source1 = claim1['edgesFrom'][0]['endNode']['name']
theclaim = claim1['name']

print("{} got {} claim from {}".format(subject, claim1['name'], source1))
