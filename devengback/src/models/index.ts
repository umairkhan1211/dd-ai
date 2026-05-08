import User from './User';
import AIUsage from './AIUsage';
import Message from './Message';
import ChatSession from './ChatSession';
import Operator from './Operator';
import Protocol from './Protocol';
import Cast from './Cast';
import UserSession from './UserSession';
import Session from './Session';
import UserSubscription from './UserSubscription';
import UserWallet from './UserWallet';
import DuckTransaction from './DuckTransaction';
import StripeEvent from './StripeEvent';
import AIModel from './AIModel';
import File from './File';
// Define all model associations here
// Existing relationships:

// User-AIUsage relationship
User.hasMany(AIUsage, {
  foreignKey: 'userId',
  as: 'aiUsage',
});
AIUsage.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// User-ChatSession relationship
User.hasMany(ChatSession, { foreignKey: 'userId' });
ChatSession.belongsTo(User, { foreignKey: 'userId' });

// ChatSession-Message relationship
ChatSession.hasMany(Message, { foreignKey: 'sessionId', onDelete: 'CASCADE' });
Message.belongsTo(ChatSession, { foreignKey: 'sessionId', onDelete: 'CASCADE' });

// Message-File relationship
Message.hasMany(File, { foreignKey: 'messageId', as: 'files', onDelete: 'CASCADE' });
File.belongsTo(Message, { foreignKey: 'messageId', as: 'message', onDelete: 'CASCADE' });

// ChatSession self-referential relationship (for parent/children)
ChatSession.belongsTo(ChatSession, { as: 'parent', foreignKey: 'parentId' });
ChatSession.hasMany(ChatSession, { foreignKey: 'parentId', as: 'children', onDelete: 'CASCADE' });

// User-Operator relationship
User.hasMany(Operator, { foreignKey: 'userId' });
Operator.belongsTo(User, { foreignKey: 'userId' });
User.belongsTo(Operator, { foreignKey: 'activeOperator', as: 'activeOperatorDetail' });

// User-Protocol relationship
User.hasMany(Protocol, { foreignKey: 'userId' });
Protocol.belongsTo(User, { foreignKey: 'userId' });

// User-Cast relationship
User.hasMany(Cast, { foreignKey: 'userId', as: 'castMembers' });
Cast.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User-UserSession relationship
User.hasMany(UserSession, { foreignKey: 'userId', as: 'sessions' });
UserSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Note: Session model is typically standalone for Express session storage
// No relationships defined unless sess JSON contains userId or sessionId references

// User-UserSubscription relationship (One-to-One)
User.hasOne(UserSubscription, {
  foreignKey: 'userId', // UserSubscription will have a userId column
  as: 'subscription', // Allows you to do user.getSubscription() or user.createSubscription()
  onDelete: 'CASCADE', // If a User is deleted, their UserSubscription record is also deleted
});
UserSubscription.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user', // Allows you to do userSubscription.getUser()
});

// User-UserWallet relationship (One-to-One)
User.hasOne(UserWallet, {
  foreignKey: 'userId', // UserWallet will have a userId column
  as: 'wallet', // Allows you to do user.getWallet() or user.createWallet()
  onDelete: 'CASCADE', // If a User is deleted, their UserWallet record is also deleted
});
UserWallet.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user', // Allows you to do userWallet.getUser()
});

// User-DuckTransaction relationship (One-to-Many)
User.hasMany(DuckTransaction, {
  foreignKey: 'userId', // DuckTransaction records will have a userId column
  as: 'duckTransactions', // Allows you to do user.getDuckTransactions()
  onDelete: 'CASCADE', // If a User is deleted, their DuckTransaction records are also deleted
});
DuckTransaction.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user', // Allows you to do duckTransaction.getUser()
});

// StripeEvent does not typically have direct associations with User model in this way.
// Its data payload usually contains relevant IDs which are then used in logic.

// AIModel relationships
// AIModel-Cast relationship (One-to-Many)
AIModel.hasMany(Cast, {
  foreignKey: 'aiModelId',
  as: 'castMembers',
  onDelete: 'SET NULL', // If AIModel is deleted, set cast members' aiModelId to null
});
Cast.belongsTo(AIModel, {
  foreignKey: 'aiModelId',
  as: 'aiModel',
});

// AIModel-Protocol relationship (One-to-Many)
AIModel.hasMany(Protocol, {
  foreignKey: 'aiModelId',
  as: 'protocols',
  onDelete: 'SET NULL', // If AIModel is deleted, set protocols' aiModelId to null
});
Protocol.belongsTo(AIModel, {
  foreignKey: 'aiModelId',
  as: 'aiModel',
});

// Export all models
export {
  User,
  AIUsage,
  Message,
  ChatSession,
  Operator,
  Protocol,
  Cast,
  UserSession,
  Session,
  UserSubscription,
  UserWallet,
  DuckTransaction,
  StripeEvent,
  AIModel,
  File,
};
