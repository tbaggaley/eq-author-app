import React from "react";
import PropTypes from "prop-types";

import ScrollPane from "components/ScrollPane";

import iconGuestAvatar from "../styles/icon-guest-avatar.svg";

import {
  List,
  ListItem,
  UserName,
  UserEmail,
  UserIcon,
  RemoveButton,
  UserOwner,
} from "../styles/UserList";

const User = PropTypes.shape({
  picture: PropTypes.string,
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
});

const propTypes = {
  UserItem: {
    user: PropTypes.shape({
      isOwner: PropTypes.bool,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      picture: PropTypes.string,
    }),
    onRemove: PropTypes.func.isRequired,
  },
  UserList: {
    editors: PropTypes.arrayOf(User).isRequired,
    owner: User.isRequired,
    onRemove: PropTypes.func.isRequired,
  },
};

const UserItem = ({ user, onRemove }) => {
  const { name, email, isOwner } = user;
  const picture = user.picture || iconGuestAvatar;
  return (
    <ListItem>
      <UserIcon src={picture} alt="" />

      <UserName>{name}</UserName>
      {!isOwner && <UserEmail>{email}</UserEmail>}

      {isOwner ? (
        <UserOwner>owner</UserOwner>
      ) : (
        <RemoveButton
          onClick={() => onRemove(user)}
          aria-label="Remove editor"
        />
      )}
    </ListItem>
  );
};

const UserList = ({ editors, owner, onRemove }) => (
  <ScrollPane css={{ marginBottom: "1em" }} permanentScrollBar={false}>
    <List>
      {[{ ...owner, isOwner: true }, ...editors].map(user => (
        <UserItem key={user.id} user={user} onRemove={onRemove} />
      ))}
    </List>
  </ScrollPane>
);

UserItem.propTypes = propTypes.UserItem;
UserList.propTypes = propTypes.UserList;

export default UserList;