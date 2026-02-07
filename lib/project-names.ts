const adjectives = [
  "lucky", "brave", "calm", "daring", "eager", "fancy", "gentle", "happy",
  "idle", "jolly", "keen", "lively", "merry", "noble", "odd", "proud",
  "quiet", "rapid", "shy", "tiny", "vivid", "warm", "zany", "bold",
  "clever", "dizzy", "fierce", "grand", "humble", "icy", "jazzy", "kind",
  "loud", "mighty", "neat", "pale", "royal", "swift", "tall", "witty",
];

const animals = [
  "goose", "buffalo", "falcon", "otter", "panda", "fox", "owl", "wolf",
  "bear", "crane", "dolphin", "eagle", "gecko", "heron", "iguana", "jaguar",
  "koala", "lemur", "moose", "newt", "osprey", "parrot", "quail", "raven",
  "seal", "tiger", "urchin", "viper", "walrus", "yak", "zebra", "badger",
  "cobra", "dingo", "elk", "finch", "gopher", "hawk", "impala", "jay",
];

export function generateProjectName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `${adj}-${animal}`;
}
