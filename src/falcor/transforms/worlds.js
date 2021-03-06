import { Observable } from 'rx';
import {
  $err,
  $ref,
  keysO,
  keys,
} from '../../utils';

export function getWorlds ( ids, user ) {
  const query = {
    $or: [
      { owners: { $eq: user._id } },
      { writers: { $eq: user._id } },
      { readers: { $eq: user._id } },
    ],
  };

  if ( ids ) {
    query._id = { $in: ids };
  }

  return this.flatMap( db => {
    return Observable.fromPromise( db.collection( 'worlds' ).find( query ).toArray() )
    .selectMany( w => w )
    ;
  });
};

export function setWorldProps ( propsById, user ) {
  return this.flatMap( db => {
    return keysO( propsById )
      .flatMap( _id => {
        const $or = [
          { owners: { $eq: user._id } },
          { writers: { $eq: user._id } },
        ];

        return db.collection( 'worlds' ).findOneAndUpdate( { _id, $or }, { $set: propsById[ _id ] }, {
          returnOriginal: false,
        });
      })
      .map( world => world.value )
      ;
  });
}

export const withCharacterRefs = indices => world => indices.map( idx => ({
  _id: world._id,
  idx,
  ref: world.characters[ idx ] ? $ref([ 'charactersById', world.characters[ idx ] ]) : undefined,
}));

export const withOutlineRefs = indices => world => indices.map( idx => ({
  _id: world._id,
  idx,
  ref: world.outlines[ idx ] ? $ref([ 'outlinesById', world.outlines[ idx ] ]) : undefined,
}));

