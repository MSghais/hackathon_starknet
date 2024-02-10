use starknet::ContractAddress;


#[starknet::contract]
mod ERC20Mintable {
    use openzeppelin::token::erc20::ERC20Component;
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::access::accesscontrol::interface::IAccessControl;
    use openzeppelin::access::accesscontrol::AccessControlComponent;

    const MINTER_ROLE: felt252 = selector!("MINTER_ROLE");
    const ADMIN_ROLE: felt252 = selector!("ADMIN_ROLE");
    const MAKER_ROLE: felt252 = selector!("MAKER_ROLE");
    use starknet::ContractAddress;

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    // Ownable
    
    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    #[abi(embed_v0)]
    impl OwnableCamelOnlyImpl =
        OwnableComponent::OwnableCamelOnlyImpl<ContractState>;
    impl InternalImplOwnable = OwnableComponent::InternalImpl<ContractState>;

    // ERC20
    #[abi(embed_v0)]
    impl ERC20Impl = ERC20Component::ERC20Impl<ContractState>;
    #[abi(embed_v0)]
    impl ERC20MetadataImpl = ERC20Component::ERC20MetadataImpl<ContractState>;
    #[abi(embed_v0)]
    impl SafeAllowanceImpl = ERC20Component::SafeAllowanceImpl<ContractState>;
    #[abi(embed_v0)]
    impl ERC20CamelOnlyImpl = ERC20Component::ERC20CamelOnlyImpl<ContractState>;
    #[abi(embed_v0)]
    impl SafeAllowanceCamelImpl =
        ERC20Component::SafeAllowanceCamelImpl<ContractState>;
    impl InternalImpl = ERC20Component::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage,

        #[substorage(v0)]
        ownable: OwnableComponent::Storage
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC20Event: ERC20Component::Event,

        #[flat]
        OwnableEvent: OwnableComponent::Event
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        name: felt252,
        symbol: felt252,
        owner: ContractAddress,
        initial_supply:u256
    ) {
        self.ownable.initializer(owner);
        self.erc20.initializer(name, symbol);
        self.erc20._mint(owner, initial_supply);

    }

    // TODO check owner 
    #[external(v0)]
    fn mint(
        ref self: ContractState,
        recipient: ContractAddress,
        amount: u256
    ) {
        self.ownable.assert_only_owner();
        self.erc20._mint(recipient, amount);
    }

}