import React from 'react';
import MainNav from '../components/layout/MainNav'

export default function Index(props: any) {
  return (
    <MainNav mainPage={props.mainPage}></MainNav>
  );
}
