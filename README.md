# Pair Programming Solver

Script for building a Tree of permutations of pair programmings while avoiding pairing with yourself, hosting the same person who is hosting you and weighted to not pair with partners you've recently paired with.

Uses a Trie data structure with a depth-first search.

Test:

```
buildAndExecuteSearch(makeSet(25), 0.95)
    .forEach(({ weight, bindings, initialHost }) => {
      console.log(`Initial Host ${initialHost}`);
      console.log('Weight', weight);
      console.log(bindings.toArray());
    });
```

Where `25` us the number of team members and `0.95` is the acceptable probability that members are matched correctly.

Run:

```
node tree.js
```

Result:

```
[ [ '11', '10' ],
  [ '22', '21' ],
  [ '12', '11' ],
  [ '23', '22' ],
  [ '13', '12' ],
  [ '24', '23' ],
  [ '14', '13' ],
  [ '25', '24' ],
  [ '15', '14' ],
  [ '16', '15' ],
  [ '18', '17' ],
  [ '19', '18' ],
  [ '1', '25' ],
  [ '2', '1' ],
  [ '3', '2' ],
  [ '4', '3' ],
  [ '5', '4' ],
  [ '6', '5' ],
  [ '7', '6' ],
  [ '8', '7' ],
  [ '9', '8' ],
  [ '20', '16' ],
  [ '10', '9' ],
  [ '21', '20' ] ]
```