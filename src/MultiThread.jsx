export const follow = async (threadAddr, { space, onUpdate }) => {
  const contract = await space.joinThreadByAddress(threadAddr)

  if(onUpdate) {
    contract.onUpdate(console.log)
  }

  const revs = await contract.getPosts()
  const out = {}
  for(let rev of revs) {
    out[rev.author] = { id: rev.postId, ...rev.message }
  }
  return out
}
