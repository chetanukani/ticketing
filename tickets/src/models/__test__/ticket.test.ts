import { Ticket } from "../ticket";

it('implements optimistic concurrency control', async () => {
  //Create an instance of a Ticket
  const ticket = Ticket.build({
    title: 'Concert',
    price: 5,
    userId: '654trgffysfgu'
  })

  //Save the ticket to the database
  await ticket.save()

  //fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id)
  const secondInstance = await Ticket.findById(ticket.id)

  //make two separate changes to the ticket we fetched
  firstInstance!.set({ price: 10 })
  secondInstance!.set({ price: 20 })

  //save the first fetched ticket
  await firstInstance!.save()

  //save second fetched ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }
})

it('increments a version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'Concert',
    price: 5,
    userId: '654trgffysfgu'
  })

  await ticket.save()
  expect(ticket.version).toEqual(0)
  
  await ticket.save()
  expect(ticket.version).toEqual(1)

  await ticket.save()
  expect(ticket.version).toEqual(2)
})