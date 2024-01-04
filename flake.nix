{
  inputs = { nixpkgs.url = "github:nixos/nixpkgs/nixos-23.11"; };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in {

      # development shell to ensure everyone 
      # have the same tools
      devShells.${system}.default = pkgs.mkShell { 
        packages = with pkgs; [ 
          nodejs_21 
          corepack 
        ]; 
      };

    };
}
