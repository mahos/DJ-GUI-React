import React from 'react';
import TableAttributesInfo from '../DataStorageClasses/TableAttributesInfo'
import Restriction from '../DataStorageClasses/Restriction'
import FilterCard from './FilterCard'
import TableAttribute from '../DataStorageClasses/TableAttribute'
import TableAttributeType from '../enums/TableAttributeType';
import './Filter.css'

type FilterState = {
  restrictions: Array<Restriction>, // Array of Restrictions objects
  tableAttributes: Array<TableAttribute>, // List of TableAttributes which is derive from primary_attribute + secondary_attributes
  currentRestrictionIDCount: number, // Used to give a unique ID to each restriction object to allow react to keep track of what is being deleted
  restrictionChangeTimeout: ReturnType<typeof setTimeout>
}

/**
 * Filter component that is in charge of managing one to many FilterCards as well as the data store beind them
 */
class Filter extends React.Component<{tableAttributesInfo?: TableAttributesInfo, setRestrictions: (restrictions: Array<Restriction>) => void}, FilterState> {
  constructor(props: any) {
    super(props);
    this.state = {
      restrictions: [new Restriction(0)],
      tableAttributes: [],
      currentRestrictionIDCount: 1,
      restrictionChangeTimeout: setTimeout(() => {}, 0)
    }
    this.addRestriction = this.addRestriction.bind(this);
    this.updateRestriction = this.updateRestriction.bind(this);
    this.deleteFilterCard = this.deleteFilterCard.bind(this);
  }

  /**
   * Add a restriction with the currentRestrictionIDCount as its ID then increment and update the state
   */
  addRestriction() {
    let restrictions: Array<Restriction> = Object.assign([], this.state.restrictions);
    restrictions.push(new Restriction(this.state.currentRestrictionIDCount));
    this.setState({restrictions: restrictions, currentRestrictionIDCount: this.state.currentRestrictionIDCount + 1});
  }

  /**
   * 
   * @param index Location of the data in the restriction array to be modified
   * @param restriction The new restriction to replace the old restriction object
   */
  updateRestriction(index: number, restriction: Restriction) {
    let restrictions: Array<Restriction> = Object.assign([], this.state.restrictions);
    restrictions[index] = restriction;
    this.setState({restrictions: restrictions});
  }

  /**
   * 
   * @param index Location of the restriction object to be deleted
   */
  deleteFilterCard(index: number) {
    let restrictions: Array<Restriction> = Object.assign([], this.state.restrictions);
    restrictions.splice(index, 1)
    this.setState({restrictions: restrictions});
  }

  /**
   * Handles computing the tableAttributes array given the primary and secondary attributes
   */
  componentDidMount() {
    // Update the tableAttribute list
    let tableAttributes: Array<TableAttribute> = this.props.tableAttributesInfo?.primaryAttributes as Array<TableAttribute>;
    tableAttributes = tableAttributes.concat(this.props.tableAttributesInfo?.secondaryAttributes as Array<TableAttribute>);

    let filterableAttributes = []

    for (let tableAttribute of tableAttributes) {
      if (tableAttribute.attributeType === TableAttributeType.BLOB) {
        continue;
      }
      filterableAttributes.push(tableAttribute);
    }
    this.setState({tableAttributes: filterableAttributes});
  }

  /**
   * Upon state change of restrictions, check if any of them are valid, if so then call the fetchTableContent function appropriately
   * @param prevProps 
   * @param prevState 
   */
  componentDidUpdate(prevProps: any, prevState: any) {
    // If state didn't change then don't do anything
    if (prevState.restrictions === this.state.restrictions) {
      return;
    }

    // Cancel timer and create a new one
    clearTimeout(this.state.restrictionChangeTimeout);

    const restrictionChangeTimeout = setTimeout(() => {
      // Check if any of the restrictions are valid, if so then send them to TableView fetchTuples
      let validRestrictions: Array<Restriction> = []
      for (let restriction of this.state.restrictions) {
        if (restriction.tableAttribute !== undefined && restriction.restrictionType !== undefined && restriction.value !== undefined && restriction.isEnable === true) {

          // Check if it is of date time varient
          if (restriction.tableAttribute.attributeType === TableAttributeType.DATETIME) {
            if (restriction.value[0] === '' || restriction.value[1] === '') {
              // Not completed yet thus break out
              continue;
            }
          }

          // Valid restriction, thus add it to the list
          validRestrictions.push(restriction);
        }
      }

      // Call fetch content if there is at lesat one valid restriction
      if (validRestrictions.length >= 0) {
        this.props.setRestrictions(validRestrictions);
      }
    }, 1000);

    this.setState({restrictionChangeTimeout: restrictionChangeTimeout});
  }

  render() {
    return(
      <div className="filterComponentDiv">
        <div className="filterCardsDiv">
          {this.state.restrictions.map((restriction, index) => {
            return(<FilterCard key={restriction.id} index={index} restriction={restriction} tableAttributes={this.state.tableAttributes} updateRestriction={this.updateRestriction} deleteFilterCard={this.deleteFilterCard}></FilterCard>)
          })}
        </div>
        <div className="filterComponentFilterCardAddDiv"><button onClick={this.addRestriction}>+</button></div>
      </div>
    )
  }
}

export default Filter