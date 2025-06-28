import { User } from "../models/user.js";
import { Status } from "../constants/index.js";
import { encriptar } from '../common/bcrypt.js';
import { Task } from "../models/task.js";
import { Op } from 'sequelize';

async function getUsers(req, res, next) {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'password', 'status'],
      order: [['id', 'DESC']],
      where: {
        status: Status.ACTIVE,
      },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  const { username, password } = req.body;
  try {
    const user = await User.create({
      username,
      password,
    })
    res.json(user)
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  const { id } = req.params;
  try {
    const user = await User.findOne({
      attributes: ['username', 'password', 'status'],
      where: {
        id,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }

}

async function updateUser(req, res, next) {
  const { id } = req.params;
  const { username, password } = req.body;
  try {
    if (!username && !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const passwordEncriptado = await encriptar(password);

    const user = await User.update({
      username,
      password: passwordEncriptado,
    }, {
      where: {
        id,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }

}

async function deleteUser(req, res, next) {
  const { id } = req.params;
  try {
    await User.destroy({
      where: {
        id,
      },
    });

    res.status(204).json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }

}

async function activateInactivate(req, res, next) {
  const { id } = req.params;
  const { status } = req.body;
  try {
    if (!status) res.status(400).json({ message: 'Status are required' });

    const user = await User.findByPk(id);

    if (!user) res.status(404).json({ message: 'User not found' });

    if (user.status === status) res.status(409).json({ message: 'Same status' });

    user.status = status;
    await user.save();

    res.json(user);
  } catch (error) {
    next(error);
  }
}

async function getTasks(req, res, next) {
  const { id } = req.params;
  try {
    const user = await User.findOne({
      attributes: ['username'],
      include: [
        {
          model: Task,
          attributes: ['name', 'done'],
        }
      ],
      where: {
        id,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
}

async function getUserListPagination(req, res, next) {
  const { 
    page = 1,
    limit = 10, 
    search = '', 
    orderBy = 'id', 
    orderDir = 'DESC'
  } = req.query;

  try {
    const validLimit = [5, 10, 15, 20];
    const validOrderBy = ['id', 'username', 'status'];
    const validOrderDir = ['ASC', 'DESC'];

    const safeLimit = validLimit.includes(limit) ? Number(limit) : 10;
    const safeOrderBy = validOrderBy.includes(orderBy) ? orderBy : 'id';
    const safeOrderDir = validOrderDir.includes(orderDir?.toUpperCase()) ? orderDir.toUpperCase() : 'DESC';

    const offset = (page - 1) * limit;
    const whereCondition = search
      ? {
        username: {
          [Op.iLike]: `%${search}%`
        }
      }
      : {};

    const { count, rows } = await User.findAndCountAll({
      attributes: ['id', 'username', 'status'],
      offset: Number(offset),
      limit: Number(safeLimit),
      where: whereCondition,
      order: [[safeOrderBy, safeOrderDir]],
    });

    const totalUsers = await User.count();

    const data = {
      total: totalUsers,
      page: Math.ceil(count / safeLimit),
      pages: Number(page),
      data: rows
    };
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export default {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  activateInactivate,
  getTasks,
  getUserListPagination,
};