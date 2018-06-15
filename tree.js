const Immutable = require("immutable");

function getBindings(root) {
  return Immutable.Map().withMutations(bindings => {
    let node = root;
    while (node) {
      bindings.set(node.host, node.name);
      node = node.parent;
    }
  });
}

function buildAndExecuteSearch(map, weightPercentage) {
  const items = Immutable.OrderedSet(Object.keys(map));

  const maxPerNode = items.size - 1;

  const weightTable = items.reduce((table, name) => {
    const recents = map[name];

    return recents.reduce((sum, g, i) => {
      sum[name] = sum[name] || {};
      sum[name][g] = i < (recents.length / 3) ? i - maxPerNode: i;
      return sum;
    }, table);
  }, {});
  
  const maxWeight = maxPerNode * items.size;

  let localMaximum = 0;
  const results = [];

  for (const i of items) {
    const list = items.toList();
    const indexOf = list.indexOf(i);
    
    const notYetHosting = list.reduce((sum, host, i) => {
      let newIndex = i - indexOf;

      if (newIndex < 0) {
        newIndex = list.size + newIndex;
      }

      return sum.set(newIndex, host);
    }, Immutable.List());

    const result = generateGuests(null, i, items, Immutable.OrderedSet(notYetHosting.remove(i)), weightTable, 0);

    if (!result) {
      continue;
    }

    result.initialHost = i;

    if ((result.weight / maxWeight) > weightPercentage) {
      return [result];
    }

    // console.log("weight", result.weight, (result.weight / maxWeight));

    if (localMaximum <= result.weight) {
      localMaximum = result.weight;
    }

    results.unshift(result);
  }

  return results;
}

function generateGuests(parent, name, guests, notYetHosting, weightTable, weight) {
  // console.log("host ", name, guests, notYetHosting);
  
  const lookup = weightTable[name];
  const max = Object.keys(weightTable).length - 1;

  const sorted = guests.sort((a, b) => {
    const aWeight = typeof lookup[a] !== 'undefined' ? lookup[a] : max;
    const bWeight = typeof lookup[b] !== 'undefined' ? lookup[b] : max;
    
    return bWeight - aWeight;
  });

  
  for (const g of sorted) {
    if (g === name) { continue; }
    
    const guest = makeGuest(parent, name, g, sorted, notYetHosting, weightTable, weight);
    const result = evaluateGuest(guest);

    if (result) {
      return result;
    }
  }
}

function makeGuest(parent, host, name, guests, notYetHosting, weightTable, weight) {
  // console.log("guest ", host, name, guests, notYetHosting);

  const lookup = weightTable[host];
  const max = Object.keys(weightTable).length - 1;

  const addedWeight = weight + (
    typeof lookup[name] !== 'undefined' ? lookup[name] : max
  );

  return new Guest(
    parent,
    host,
    name,
    guests,
    notYetHosting,
    weightTable,
    addedWeight
  );
}

function evaluateGuest(guest) {
  if (guest.notYetHosting.size <= 0) {
    return {
      weight: guest.weight,
      bindings: getBindings(guest)
    }
  }

  for (const h of guest.notYetHosting) {
    let possibleGuests = guest.guests.remove(guest.name);

    for (const [g1, h1] of getBindings(guest)) {
      if (h === h1) {
        possibleGuests = possibleGuests.remove(g1);
      }
    }

    const stillNotHosting = guest.notYetHosting.remove(h);

    if (Immutable.is(possibleGuests, stillNotHosting)) {
      // console.log("Dead end")
      continue;
    }

    const result = generateGuests(
      guest,
      h,
      possibleGuests,
      stillNotHosting,
      guest.weightTable,
      guest.weight
    );

    if (result) {
      return result;
    }
  }
}

class Guest {
  constructor(parent, host, name, guests, notYetHosting, weightTable, weight) {
    // console.log("guest ", host, name, guests, notYetHosting);

    this.parent = parent;
    this.host = host;
    this.name = name;
    this.guests = guests;
    this.notYetHosting = notYetHosting;
    this.weightTable = weightTable;
    this.weight = weight;
  }
}

function makeSet(max) {
  return Immutable.Range(1, max + 1)
      .reduce((sum, i) => {
        sum[i] = Immutable.Range(i + 1, max + 1).toArray().concat(Immutable.Range(1, i).toArray()).map((i) => i.toString());
        return sum;
      }, {});
}

buildAndExecuteSearch(makeSet(25), 0.95)
    .forEach(({ weight, bindings, initialHost }) => {
      console.log(`Initial Host ${initialHost}`);
      console.log('Weight', weight);
      console.log(bindings.toArray());
    });
