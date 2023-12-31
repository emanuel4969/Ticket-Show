const { Op } = require('sequelize');
const { Event, Artist, Genre } = require('../../db');

const filterAllEvents = async ({
    name,
    description,
    beginDate,
    endDate,
    city,
    address,
    artist,
    genre,
    // search,
}) =>
// { limit, offset }
{
    // si alguno de los campos me llega undefined, lo seteo a vacio
    name = name || '';
    description = description || '';
    beginDate = beginDate || '';
    endDate = endDate || '';
    city = city || '';
    address = address || '';
    artist = artist || '';
    genre = genre || '';
    // search = search || '';

    let where = {};

    if (name) {
        where.name = {
            [Op.iLike]: `%${name}%`,
        };
        where.state = true;
    }
    if (description) {
        where.description = {
            [Op.iLike]: `%${description}%`,
        };
        where.state = true;
    }

    if (beginDate && !endDate) {
        where.date = {
            [Op.gte]: beginDate,
        };
        where.state = true;
    }

    if (beginDate && endDate) {
        where.date = {
            [Op.between]: [beginDate, endDate],
        };
        where.state = true;
    }

    if (!beginDate && endDate) {
        where.date = {
            [Op.lte]: endDate,
        };
        where.state = true;
    }

    if (city) {
        where.city = {
            [Op.iLike]: `%${city}%`,
        };
        where.state = true;
    }

    if (address) {
        where.address = {
            [Op.iLike]: `%${address}%`,
        };
        where.state = true;
    }

    // buscamos el artista por su id en la tabla artist
    if (artist) {
        const artistId = await Artist.findOne({
            where: { id: artist, state: true },
        });

        if (artistId) {
            where.state = true;
            const events = await Event.findAll({
                where,
                include: [
                    {
                        model: Artist,
                        where: { id: artistId.id },
                    },
                ],
            });
            return events;
        }
    }

    // buscamos el genero por su nombre en la tabla genre
    if (genre) {
        where.genre = {
            [Op.iLike]: `%${genre}%`,
        };
        where.state = true;
    }

    // si no viene ningun filtro, se devuelve todos los eventos
    if (
        !name &&
        !description &&
        !beginDate &&
        !endDate &&
        !city &&
        !address &&
        !genre &&
        !artist
    ) {
        where = { state: true };
    }


    const events = await Event.findAll({
        where,
        order: [['date', 'ASC']],
        // limit,
        // offset,
    });

    return events;
};

module.exports = {
    filterAllEvents,
};