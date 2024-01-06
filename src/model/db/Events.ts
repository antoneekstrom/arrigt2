import { Prisma } from "@prisma/client";
import { PrismaDelegate } from "../../prisma";
import { closeEvent, openEvent } from "../events";

export class Events extends PrismaDelegate {
  /**
   * Returns all events.
   * @param prisma the prisma client
   * @returns all events
   */
  findAll() {
    return this.prisma.event.findMany();
  }

  /**
   * Returns the event with the given id.
   * Throws if there is no unique event with the given id.
   * @param prisma prisma client
   * @param id id of the event
   * @returns event
   */
  findById(id: string) {
    return this.prisma.event.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  /**
   * Updates the event with the given id.
   * @param prisma prisma client
   * @param id id of the event
   * @param data new data to apply
   * @returns updated event
   */
  updateById(id: string, data: Prisma.EventUpdateInput) {
    return this.prisma.event.update({
      where: {
        id,
      },
      data,
    });
  }

  /**
   * Creates a new event with the given data and a random id.
   * @param prisma prisma client
   * @param data event data
   * @returns created event
   */
  create(data: Prisma.EventCreateInput) {
    return this.prisma.event.create({
      data,
    });
  }

  deleteById(id: string) {
    return this.prisma.event.delete({
      where: {
        id,
      },
    });
  }

  closeById(id: string) {
    return this.updateById(id, closeEvent());
  }

  openById(id: string) {
    return this.updateById(id, openEvent());
  }
}
