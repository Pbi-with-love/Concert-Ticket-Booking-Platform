import redis from "../../config/redis.js";
import { redisKeys } from "../../utils/redisKey.js";
import { toConcertDTO } from "../../utils/concertDTO.js";
import { toTicketCategoriesDTO } from "../../utils/ticketCategoriesDTO.js";
import {
  findAllConcertsRepository,
  findConcertByIdRepository,
  findConcertsByIdsRepository,
} from "../../modules/concert/concert.repository.js";


export const getAllConcertsCache = async () => {
  const allConcertsCached = await redis.get(redisKeys.allConcerts());

  if (allConcertsCached) {
    const ids = JSON.parse(allConcertsCached);

    if (!ids.length) {
      return [];
    }

    const keys = ids.map((id) => redisKeys.concertById(id));
    const cachedConcertsRaw = await redis.mGet(keys);

    const concertsById = new Map();
    const missingIds = [];

    cachedConcertsRaw.forEach((cache, index) => {
      if (cache) {
        const concert = JSON.parse(cache);
        concertsById.set(concert.id, concert);
      } else {
        missingIds.push(ids[index]);
      }
    });

    if (missingIds.length > 0) {
      const missingConcerts = await findConcertsByIdsRepository(missingIds);
      const normalizedMissingConcerts = missingConcerts.map(toConcertDTO);

      await Promise.all(
        normalizedMissingConcerts.map((concert) =>
          redis.set(
            redisKeys.concertById(concert.id),
            JSON.stringify(concert),
            "EX",
            300,
          ),
        ),
      );

      normalizedMissingConcerts.forEach((concert) => {
        concertsById.set(concert.id, concert);
      });
    }

    return ids
      .map((id) => concertsById.get(id))
      .filter((concert) => Boolean(concert));
  }

  const concerts = await findAllConcertsRepository();
  const normalizedConcerts = concerts.map(toConcertDTO);
  const ids = normalizedConcerts.map((concert) => concert.id);

  await redis.set(redisKeys.allConcerts(), JSON.stringify(ids), "EX", 300);

  await Promise.all(
    normalizedConcerts.map((concert) =>
      redis.set(
        redisKeys.concertById(concert.id),
        JSON.stringify(concert),
        "EX",
        300,
      ),
    ),
  );

  return normalizedConcerts;
};

export const getConcertByIdCache = async (concertId) => {
  const key = redisKeys.concertById(concertId);
  const cached = await redis.get(key);

  if (cached) {
    return JSON.parse(cached);
  }

  const concert = await findConcertByIdRepository(concertId);

  if (!concert) {
    return null;
  }

  const dto = toConcertDTO(concert);

  await redis.set(key, JSON.stringify(dto), "EX", 300);

  return dto;
};

export const getTicketCategoriesByConcertIdCache = async (concertId) => {
  const key = redisKeys.ticketCategoriesByConcertId(concertId);
  const cached = await redis.get(key);

  if (cached) {
    return JSON.parse(cached);
  }

  const concert = await findConcertByIdRepository(concertId);

  if (!concert) {
    return null;
  }

  const ticketCategories = toTicketCategoriesDTO(concert.ticketCategories);

  await redis.set(key, JSON.stringify(ticketCategories), "EX", 300);

  return ticketCategories;
};

export const invalidateAllConcertsCache = async () => {
  await redis.del(redisKeys.allConcerts());
};

export const invalidateConcertCache = async (concertId) => {
  await redis.del(redisKeys.allConcerts());

  await redis.del(redisKeys.concertById(concertId));

  await redis.del(
    redisKeys.ticketCategoriesByConcertId(concertId),
  );
};

export const invalidateTicketCategoriesByConcertIdCache = async (concertId) => {
  await redis.del(
    redisKeys.ticketCategoriesByConcertId(concertId),
  );
}
