import { StyleSheet, Text, View,Image,TouchableOpacity } from 'react-native'
import React from 'react'

const profile = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <TouchableOpacity>
          <Image 
         source={require('../../assets/images/avator.png')}
         resizeMode='contain'
         style={styles.profileImage}/>
        </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default profile

const styles = StyleSheet.create({
  container:{
    flex:1
  },
  header:{
    height:120,
    width:'100%',
    backgroundColor:'#3194f1da',
    borderBottomWidth:1,
  },
  profileImageContainer:{
    
  }
  profileImage:{
    height:'100%',
    width:'100%'
  }
})